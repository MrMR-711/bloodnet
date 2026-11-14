import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

os.environ.setdefault("DATABASE_URL", f"sqlite:///{(Path(__file__).resolve().parents[1] / 'data' / 'test_bloodnet.db').as_posix()}")
os.environ.setdefault("KIT_PATH", str(Path(__file__).resolve().parents[2] / "participant_kit"))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db import Base, SessionLocal, engine
from app.main import app
from app.models import Dispatch, Notification, Request

HOSPITAL = {"Authorization": "Bearer hospital-token"}
COORDINATOR = {"Authorization": "Bearer coordinator-token"}


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield


@pytest.fixture
def client():
    with TestClient(app) as value:
        yield value


def create(client, key="key-1", units=2, hospital="H01", group="O+", product="red_cells", urgency="critical", sim="10"):
    return client.post(
        "/requests",
        headers={**HOSPITAL, "Idempotency-Key": key, "X-Sim-Time": sim},
        json={"hospital_id": hospital, "blood_group": group, "product": product, "units": units, "urgency": urgency},
    )


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_readiness_health(client):
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json() == {"ok": True, "database": "ok"}


def test_request_id_generated_and_preserved(client):
    generated = client.get("/health")
    assert generated.headers.get("X-Request-ID")

    preserved = client.get("/health", headers={"X-Request-ID": "caller-123"})
    assert preserved.headers.get("X-Request-ID") == "caller-123"


def test_concurrent_dispatch_replay_allocates_once(client, monkeypatch):
    calls = []

    def fake_dispatch(payload):
        calls.append(payload["dispatch_id"])
        time.sleep(0.2)
        return 201, {
            "dispatch_id": payload["dispatch_id"],
            "units": payload["units"],
            "eta_sim_min": 15,
        }

    monkeypatch.setattr("app.routers.dispatch_stock", fake_dispatch)
    rid = create(client, units=1).json()["request_id"]
    payload = {
        "dispatch_id": "DSP-concurrent",
        "request_id": rid,
        "center_id": "C01",
        "blood_group": "O+",
        "product": "red_cells",
        "units": 1,
    }

    def call():
        return client.post(
            "/inventory/dispatch",
            headers={**HOSPITAL, "X-Sim-Time": "20"},
            json=payload,
        )

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = [future.result() for future in [pool.submit(call), pool.submit(call)]]

    assert sorted(result.status_code for result in results) == [200, 201]
    assert len(calls) == 1
    with SessionLocal() as db:
        request = db.get(Request, rid)
        assert request.allocated_units == 1
        assert len(db.scalars(select(Dispatch).where(Dispatch.request_id == rid)).all()) == 1


def test_create_idempotent_replay(client):
    first = create(client)
    assert first.status_code == 201
    replay = create(client)
    assert replay.status_code == 200
    assert replay.json()["request_id"] == first.json()["request_id"]


def test_idempotency_reuse_different_body(client):
    assert create(client).status_code == 201
    other = client.post(
        "/requests",
        headers={**HOSPITAL, "Idempotency-Key": "key-1", "X-Sim-Time": "11"},
        json={"hospital_id": "H01", "blood_group": "O+", "product": "red_cells", "units": 3, "urgency": "critical"},
    )
    assert other.status_code == 422
    assert other.json()["error"]["code"] == "idempotency_key_reuse"


def test_missing_key_and_invalid_input(client):
    missing = client.post("/requests", headers={**HOSPITAL, "X-Sim-Time": "10"}, json={
        "hospital_id": "H01", "blood_group": "O+", "product": "red_cells", "units": 2, "urgency": "critical",
    })
    assert missing.status_code == 400
    bad = client.post(
        "/requests",
        headers={**HOSPITAL, "Idempotency-Key": "bad", "X-Sim-Time": "10"},
        json={"hospital_id": "H01", "blood_group": "Z+", "product": "red_cells", "units": 2, "urgency": "critical"},
    )
    assert bad.status_code == 400


def test_unknown_hospital_rejected(client):
    response = create(client, hospital="H99")
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "unknown_hospital"


def test_catalog_exposes_kit_ids(client):
    response = client.get("/catalog", headers=HOSPITAL)
    assert response.status_code == 200
    body = response.json()
    assert any(item["id"] == "H01" for item in body["hospitals"])
    assert any(item["id"].startswith("MC") for item in body["centers"])


def test_audit_and_donor_read_endpoints(client, monkeypatch):
    monkeypatch.setattr("app.services.inventory_items", lambda: [])
    monkeypatch.setattr("app.services.send_message", lambda payload: (202, {"ok": True}))

    rid = create(client, units=1).json()["request_id"]
    approved = client.post(f"/requests/{rid}/approve", headers={**COORDINATOR, "X-Sim-Time": "20"}, json={})
    assert approved.status_code == 200

    audit_response = client.get("/audit", headers=HOSPITAL)
    assert audit_response.status_code == 200
    assert any(item["request_id"] == rid for item in audit_response.json()["items"])

    donor_response = client.get("/donors", headers=HOSPITAL)
    assert donor_response.status_code == 200
    donors = donor_response.json()["items"]
    assert any(item["request_id"] == rid and item["blood_group"] for item in donors)


def test_request_lifecycle_and_callback_dedupe(client, monkeypatch):
    monkeypatch.setattr("app.services.inventory_items", lambda: [])
    monkeypatch.setattr("app.services.send_message", lambda payload: (202, {"ok": True}))

    created = create(client, units=2)
    rid = created.json()["request_id"]
    approved = client.post(f"/requests/{rid}/approve", headers={**COORDINATOR, "X-Sim-Time": "20"}, json={})
    assert approved.status_code == 200
    assert approved.json()["status"] != "pending_review"

    with SessionLocal() as db:
        notif = db.scalar(select(Notification).where(
            Notification.request_id == rid, Notification.template == "request_wave"
        ))
        assert notif is not None
        donor_id = notif.donor_id
        notification_id = notif.id

    event = {
        "event_id": "evt-one", "request_id": rid, "donor_id": donor_id,
        "notification_id": notification_id, "response": "accepted", "sim_time": 21,
    }
    first = client.post("/callbacks/donor-response", json=event)
    second = client.post("/callbacks/donor-response", json=event)
    assert first.status_code == 200
    assert second.status_code == 200

    progress = {"event_id": "evt-two", "request_id": rid, "donor_id": donor_id, "event": "en_route", "sim_time": 22}
    client.post("/callbacks/donor-progress", json=progress)
    client.post("/callbacks/donor-progress", json=progress)
    state = client.get(f"/requests/{rid}", headers=HOSPITAL).json()
    assert state["en_route"] <= 1
    assert state["fulfilled"] == 0


def test_out_of_order_callbacks_do_not_double_count(client, monkeypatch):
    monkeypatch.setattr("app.services.inventory_items", lambda: [])
    monkeypatch.setattr("app.services.send_message", lambda payload: (202, {"ok": True}))

    rid = create(client, units=2).json()["request_id"]
    approved = client.post(f"/requests/{rid}/approve", headers={**COORDINATOR, "X-Sim-Time": "20"}, json={})
    assert approved.status_code == 200

    with SessionLocal() as db:
        notification = db.scalar(select(Notification).where(
            Notification.request_id == rid, Notification.template == "request_wave"
        ))
        assert notification is not None
        donor_id = notification.donor_id

    donated = {
        "event_id": "evt-donated-before-accepted",
        "request_id": rid,
        "donor_id": donor_id,
        "event": "donated",
        "sim_time": 30,
    }
    accepted = {
        "event_id": "evt-accepted-after-donated",
        "request_id": rid,
        "donor_id": donor_id,
        "response": "accepted",
        "sim_time": 31,
    }
    assert client.post("/callbacks/donor-progress", json=donated).status_code == 200
    assert client.post("/callbacks/donor-response", json=accepted).status_code == 200

    state = client.get(f"/requests/{rid}", headers=HOSPITAL).json()
    assert state["supplied_units"] == 1
    assert state["fulfilled"] == 1
    assert state["confirmed"] == 1
    assert state["status"] == "partially_fulfilled"


def test_cancel_twice_and_amend(client):
    created = create(client)
    rid = created.json()["request_id"]
    assert client.post(f"/requests/{rid}/cancel", headers={**HOSPITAL, "X-Sim-Time": "30"}).status_code == 200
    assert client.post(f"/requests/{rid}/cancel", headers={**HOSPITAL, "X-Sim-Time": "31"}).status_code == 200
    assert client.post(f"/requests/{rid}/amend", headers={**HOSPITAL, "X-Sim-Time": "32"}, json={"urgency": "planned"}).status_code == 409


def test_unknown_request_and_auth(client):
    assert client.get("/requests/REQ-unknown", headers=HOSPITAL).status_code == 404
    assert client.get("/requests/REQ-unknown").status_code == 401
    assert client.post("/requests/REQ-unknown/approve", headers=COORDINATOR, json={}).status_code == 404


def test_smart_advice_uses_current_simulation_time(client):
    rid = create(client, urgency="urgent").json()["request_id"]
    early = client.get(f"/smart/requests/{rid}", headers={**HOSPITAL, "X-Sim-Time": "10"})
    late = client.get(f"/smart/requests/{rid}", headers={**HOSPITAL, "X-Sim-Time": "100"})
    assert early.status_code == 200 and late.status_code == 200
    early_body, late_body = early.json(), late.json()
    assert late_body["elapsed_minutes"] == 90
    assert late_body["sla_minutes"] == 240
    early_pressure = next(f["value"] for f in early_body["factors"] if f["name"] == "sla_pressure")
    late_pressure = next(f["value"] for f in late_body["factors"] if f["name"] == "sla_pressure")
    assert late_pressure > early_pressure
    assert late_body["priority_score"] > early_body["priority_score"]


def test_smart_advice(client):
    created = create(client)
    rid = created.json()["request_id"]
    advice = client.get(f"/smart/requests/{rid}", headers=HOSPITAL)
    assert advice.status_code == 200
    body = advice.json()
    assert body["request_id"] == rid
    assert "priority_score" in body
    assert "disclaimer" in body


def test_dispatch_id_cannot_be_reused_for_another_request(client, monkeypatch):
    calls = []

    def fake_dispatch(payload):
        calls.append(payload["dispatch_id"])
        return 201, {"dispatch_id": payload["dispatch_id"], "units": payload["units"], "eta_sim_min": 12}

    monkeypatch.setattr("app.routers.dispatch_stock", fake_dispatch)
    first = create(client, key="dispatch-owner-a", units=1).json()["request_id"]
    second = create(client, key="dispatch-owner-b", units=1).json()["request_id"]
    payload = {
        "dispatch_id": "DSP-shared", "request_id": first, "center_id": "MC1",
        "blood_group": "O+", "product": "red_cells", "units": 1,
    }
    assert client.post("/inventory/dispatch", headers={**HOSPITAL, "X-Sim-Time": "20"}, json=payload).status_code == 201

    payload["request_id"] = second
    conflict = client.post("/inventory/dispatch", headers={**HOSPITAL, "X-Sim-Time": "21"}, json=payload)
    assert conflict.status_code == 409
    assert conflict.json()["error"]["code"] == "dispatch_id_conflict"
    with SessionLocal() as db:
        assert db.get(Request, second).allocated_units == 0
    assert calls == ["DSP-shared"]


def test_dispatch_cannot_exceed_remaining_units(client, monkeypatch):
    calls = []
    monkeypatch.setattr("app.routers.dispatch_stock", lambda payload: (calls.append(payload), (201, {}))[1])
    rid = create(client, key="dispatch-overfill", units=1).json()["request_id"]
    payload = {
        "dispatch_id": "DSP-too-many", "request_id": rid, "center_id": "MC1",
        "blood_group": "O+", "product": "red_cells", "units": 2,
    }
    response = client.post("/inventory/dispatch", headers={**HOSPITAL, "X-Sim-Time": "20"}, json=payload)
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "dispatch_exceeds_remaining"
    with SessionLocal() as db:
        assert db.get(Request, rid).allocated_units == 0
    assert calls == []


def test_late_progress_after_donation_does_not_rewind_state(client, monkeypatch):
    monkeypatch.setattr("app.services.inventory_items", lambda: [])
    monkeypatch.setattr("app.services.send_message", lambda payload: (202, {"ok": True}))
    rid = create(client, key="late-progress", units=2).json()["request_id"]
    assert client.post(f"/requests/{rid}/approve", headers={**COORDINATOR, "X-Sim-Time": "20"}, json={}).status_code == 200
    with SessionLocal() as db:
        donor_id = db.scalar(select(Notification).where(
            Notification.request_id == rid, Notification.template == "request_wave"
        )).donor_id

    assert client.post("/callbacks/donor-progress", json={
        "event_id": "late-donated", "request_id": rid, "donor_id": donor_id,
        "event": "donated", "sim_time": 30,
    }).status_code == 200
    assert client.post("/callbacks/donor-progress", json={
        "event_id": "late-en-route", "request_id": rid, "donor_id": donor_id,
        "event": "en_route", "sim_time": 31,
    }).status_code == 200
    state = client.get(f"/requests/{rid}", headers=HOSPITAL).json()
    assert state["en_route"] == 0
    assert state["supplied_units"] == 1
    assert state["last_event"] == "donor_donated"
    assert state["status"] == "partially_fulfilled"


def test_donation_after_cancel_is_ignored(client, monkeypatch):
    monkeypatch.setattr("app.services.inventory_items", lambda: [])
    monkeypatch.setattr("app.services.send_message", lambda payload: (202, {"ok": True}))
    rid = create(client, key="cancel-then-donate", units=2).json()["request_id"]
    assert client.post(f"/requests/{rid}/approve", headers={**COORDINATOR, "X-Sim-Time": "20"}, json={}).status_code == 200
    with SessionLocal() as db:
        donor_id = db.scalar(select(Notification).where(
            Notification.request_id == rid, Notification.template == "request_wave"
        )).donor_id
    assert client.post(f"/requests/{rid}/cancel", headers={**HOSPITAL, "X-Sim-Time": "25"}).status_code == 200
    assert client.post("/callbacks/donor-progress", json={
        "event_id": "donated-after-cancel", "request_id": rid, "donor_id": donor_id,
        "event": "donated", "sim_time": 26,
    }).status_code == 200
    state = client.get(f"/requests/{rid}", headers=HOSPITAL).json()
    assert state["status"] == "cancelled"
    assert state["supplied_units"] == 0
    assert state["fulfilled"] == 0


def test_two_donations_cannot_overfill_request(client, monkeypatch):
    monkeypatch.setattr("app.services.inventory_items", lambda: [])
    monkeypatch.setattr("app.services.send_message", lambda payload: (202, {"ok": True}))
    rid = create(client, key="overfill-donors", units=1).json()["request_id"]
    assert client.post(f"/requests/{rid}/approve", headers={**COORDINATOR, "X-Sim-Time": "20"}, json={}).status_code == 200
    with SessionLocal() as db:
        donors = db.scalars(select(Notification).where(
            Notification.request_id == rid, Notification.template == "request_wave"
        )).all()
        assert len(donors) >= 2
        donor_ids = [row.donor_id for row in donors[:2]]

    for index, donor_id in enumerate(donor_ids):
        assert client.post("/callbacks/donor-progress", json={
            "event_id": f"overfill-donated-{index}", "request_id": rid, "donor_id": donor_id,
            "event": "donated", "sim_time": 30 + index,
        }).status_code == 200
    state = client.get(f"/requests/{rid}", headers=HOSPITAL).json()
    assert state["supplied_units"] == 1
    assert state["fulfilled"] == 1
    assert state["status"] == "fulfilled"


def test_unhandled_error_keeps_request_id_and_cors(monkeypatch):
    def explode(_db, _request_id):
        raise RuntimeError("boom")

    monkeypatch.setattr("app.routers.get_request", explode)
    with TestClient(app, raise_server_exceptions=False) as failing:
        response = failing.get(
            "/requests/REQ-boom",
            headers={**HOSPITAL, "Origin": "http://localhost:5173", "X-Request-ID": "boom-123"},
        )
    assert response.status_code == 500
    assert response.headers["X-Request-ID"] == "boom-123"
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_alembic_upgrade_and_check(tmp_path):
    database = tmp_path / "alembic_test.db"
    env = {**os.environ, "DATABASE_URL": f"sqlite:///{database.as_posix()}"}
    backend = Path(__file__).resolve().parents[1]
    upgrade = subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=backend, env=env, capture_output=True, text=True,
    )
    assert upgrade.returncode == 0, upgrade.stderr
    check = subprocess.run(
        [sys.executable, "-m", "alembic", "check"],
        cwd=backend, env=env, capture_output=True, text=True,
    )
    assert check.returncode == 0, check.stdout + check.stderr
