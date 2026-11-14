import os
from pathlib import Path

os.environ.setdefault("DATABASE_URL", f"sqlite:///{(Path(__file__).resolve().parents[1] / 'data' / 'test_bloodnet.db').as_posix()}")
os.environ.setdefault("KIT_PATH", str(Path(__file__).resolve().parents[2] / "participant_kit"))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.db import Base, SessionLocal, engine
from app.main import app
from app.models import Notification

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


def create(client, key="key-1", units=2, hospital="H01", group="O+", product="red_cells"):
    return client.post(
        "/requests",
        headers={**HOSPITAL, "Idempotency-Key": key, "X-Sim-Time": "10"},
        json={"hospital_id": hospital, "blood_group": group, "product": product, "units": units, "urgency": "critical"},
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


def test_smart_advice(client):
    created = create(client)
    rid = created.json()["request_id"]
    advice = client.get(f"/smart/requests/{rid}", headers=HOSPITAL)
    assert advice.status_code == 200
    body = advice.json()
    assert body["request_id"] == rid
    assert "priority_score" in body
    assert "disclaimer" in body
