from __future__ import annotations

import hashlib
import json
import logging
import math
import threading
import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from .clients import dispatch_stock, gateway_clock, inventory_items, send_message
from .config import settings
from .data import BLOOD_GROUPS, donor_eligible, is_compatible, km_between, load_kit
from .errors import ApiError
from .models import AuditEvent, Dispatch, DonorEvent, IdempotencyRecord, Notification, Request
from .schemas import NewRequest

logger = logging.getLogger("bloodnet.services")

CREATE_LOCK = threading.Lock()
ACTIVATION_LOCK = threading.Lock()
CALLBACK_LOCK = threading.RLock()
TERMINAL = {"fulfilled", "cancelled", "expired"}


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:16]}"


def body_hash(body: dict) -> str:
    canonical = json.dumps(body, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def audit(db, sim: float, request_id: str | None, actor: str, role: str, kind: str, summary: str, effect: str = "") -> None:
    db.add(AuditEvent(sim_time=sim, request_id=request_id, actor=actor, actor_role=role, type=kind, summary=summary, effect=effect))


def request_state(req: Request) -> dict:
    return {
        "request_id": req.id,
        "status": req.status,
        "needed": req.units,
        "confirmed": req.confirmed,
        "en_route": req.en_route,
        "arrived": req.arrived,
        "fulfilled": req.fulfilled,
        "units": req.units,
        "allocated_units": req.allocated_units,
        "supplied_units": req.supplied_units,
        "remaining_units": max(0, req.units - req.supplied_units),
        "hospital_id": req.hospital_id,
        "hospital_name": req.hospital_name,
        "blood_group": req.blood_group,
        "product": req.product,
        "urgency": req.urgency,
        "note": req.note,
        "created_sim": req.created_sim,
        "updated_sim": req.updated_sim,
        "last_event": req.last_event,
    }


def get_request(db, request_id: str) -> Request:
    req = db.get(Request, request_id)
    if req is None:
        raise ApiError(404, "not_found", "request not found")
    return req


def create_request(db, body: NewRequest, key: str, sim: float) -> tuple[int, dict]:
    kit = load_kit()
    if body.hospital_id not in kit.hospitals:
        raise ApiError(400, "unknown_hospital", f"hospital {body.hospital_id} is not registered")
    digest = body_hash(body.model_dump())
    with CREATE_LOCK:
        old = db.get(IdempotencyRecord, key)
        if old is not None:
            if old.body_hash != digest:
                raise ApiError(422, "idempotency_key_reuse", "Idempotency-Key was reused with a different body")
            return 200, json.loads(old.response_json)
        req = Request(
            id=new_id("REQ"), hospital_id=body.hospital_id,
            hospital_name=kit.hospitals[body.hospital_id].name,
            blood_group=body.blood_group, product=body.product, units=body.units,
            urgency=body.urgency, note=body.note, status="pending_review",
            created_sim=sim, updated_sim=sim, last_event="request_created",
        )
        db.add(req)
        db.flush()
        state = request_state(req)
        db.add(IdempotencyRecord(key=key, body_hash=digest, request_id=req.id, status_code=201, response_json=json.dumps(state, ensure_ascii=False)))
        audit(db, sim, req.id, "hospital", "hospital", "request_created", f"درخواست {body.units} واحد {body.product} ثبت شد", "وضعیت: pending_review")
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            old = db.get(IdempotencyRecord, key)
            if old is None:
                raise
            if old.body_hash != digest:
                raise ApiError(422, "idempotency_key_reuse", "Idempotency-Key was reused with a different body") from None
            return 200, json.loads(old.response_json)
        return 201, state


def approve_request(db, request_id: str, sim: float) -> dict:
    req = get_request(db, request_id)
    if req.status != "pending_review":
        raise ApiError(409, "invalid_state", f"request is {req.status}, expected pending_review")
    req.status = "open"
    req.approved_sim = sim
    req.updated_sim = sim
    req.last_event = "request_approved"
    audit(db, sim, req.id, "coordinator", "coordinator", "request_approved", "درخواست تأیید شد", "وضعیت: open")
    db.commit()
    activate_request(db, req.id)
    db.refresh(req)
    return request_state(req)


def cancel_request(db, request_id: str, sim: float) -> dict:
    req = get_request(db, request_id)
    if req.status == "cancelled":
        return request_state(req)
    if req.status in TERMINAL:
        raise ApiError(409, "invalid_state", f"request is {req.status}")
    req.status = "cancelled"
    req.updated_sim = sim
    req.last_event = "request_cancelled"
    for notif in db.scalars(select(Notification).where(Notification.request_id == req.id, Notification.active.is_(True))).all():
        notif.active = False
        notif.updated_sim = sim
        _send_template(db, req, notif.donor_id, "cancelled", sim)
    audit(db, sim, req.id, "hospital", "hospital", "request_cancelled", "درخواست لغو شد", "وضعیت: cancelled")
    db.commit()
    return request_state(req)


def amend_request(db, request_id: str, urgency: str, sim: float) -> dict:
    req = get_request(db, request_id)
    if req.status in TERMINAL:
        raise ApiError(409, "invalid_state", f"request is {req.status}")
    req.urgency = urgency
    req.updated_sim = sim
    req.last_event = "request_amended"
    audit(db, sim, req.id, "hospital", "hospital", "request_amended", "فوریت درخواست اصلاح شد", f"فوریت: {urgency}")
    db.commit()
    return request_state(req)


def _send_template(db, req: Request, donor_id: str, template: str, sim: float) -> Notification | None:
    notification_id = new_id("NTF")
    payload = {
        "notification_id": notification_id,
        "donor_id": donor_id,
        "template": template,
        "request_id": req.id,
        "callback_url": settings.self_url.rstrip('/'),
    }
    row = Notification(
        id=notification_id, request_id=req.id, donor_id=donor_id, template=template,
        gateway_status="queued", active=template in ("request_wave", "confirmed"),
        created_sim=sim, updated_sim=sim,
    )
    db.add(row)
    # Commit before the Gateway can deliver callbacks, otherwise a fast callback
    # may arrive before the notification row is visible and be rejected as unknown.
    db.commit()
    status, _ = send_message(payload)
    if status not in (200, 201, 202):
        row.gateway_status = "failed"
        row.active = False
        db.commit()
        return None
    return row


def _pick_donors(db, req: Request, sim: float, limit: int) -> list:
    kit = load_kit()
    hospital = kit.hospitals.get(req.hospital_id)
    already = set(db.scalars(select(Notification.donor_id).where(
        Notification.request_id == req.id, Notification.template == "request_wave"
    )).all())
    busy = set(db.scalars(select(Notification.donor_id).where(
        Notification.template == "request_wave", Notification.active.is_(True), Notification.response == "accepted"
    )).all())
    candidates = []
    for donor in kit.donors:
        if donor.donor_id in already or donor.donor_id in busy:
            continue
        if not is_compatible(req.product, donor.blood_group, req.blood_group):
            continue
        if not donor_eligible(donor, req.product, sim):
            continue
        last_donated = db.scalar(select(func.max(DonorEvent.sim_time)).where(
            DonorEvent.donor_id == donor.donor_id, DonorEvent.event == "donated"
        ))
        if last_donated is not None:
            interval_days = (
                (60 if donor.sex == "M" else 90) if req.product == "red_cells" else 14
            )
            if sim - last_donated < interval_days * 1440:
                continue
        distance = km_between(hospital.lat, hospital.lon, donor.lat, donor.lon) if hospital else 0.0
        candidates.append((distance, donor.donor_id))
    candidates.sort()
    return [donor_id for _, donor_id in candidates[:limit]]


def activate_request(db, request_id: str) -> None:
    with ACTIVATION_LOCK:
        db.expire_all()
        req = db.get(Request, request_id)
        if req is None or req.status not in ("open", "mobilizing"):
            return
        sim = req.updated_sim or 0.0
        kit = load_kit()
        hospital = kit.hospitals.get(req.hospital_id)
        remaining = max(0, req.units - req.allocated_units)
        items = [
            item for item in inventory_items()
            if item.get("product") == req.product
            and item.get("units", 0) > 0
            and is_compatible(req.product, item.get("blood_group", ""), req.blood_group)
        ]
        items.sort(key=lambda item: (
            (km_between(
                hospital.lat, hospital.lon,
                kit.centers[item["center_id"]].lat, kit.centers[item["center_id"]].lon,
            ) if hospital and item.get("center_id") in kit.centers else 0.0)
            if req.urgency in ("critical", "urgent") else
            float(item.get("expires_sim_min", 0)),
            float(item.get("expires_sim_min", 0)),
            (km_between(
                hospital.lat, hospital.lon,
                kit.centers[item["center_id"]].lat, kit.centers[item["center_id"]].lon,
            ) if hospital and item.get("center_id") in kit.centers else 0.0),
        ))
        dispatched = 0
        for item in items:
            if remaining <= 0:
                break
            units = min(int(item["units"]), remaining)
            dispatch_id = new_id("DSP")
            payload = {
                "dispatch_id": dispatch_id, "request_id": req.id,
                "center_id": item["center_id"], "blood_group": item["blood_group"],
                "product": req.product, "units": units,
                "hospital_id": req.hospital_id, "recipient_blood_group": req.blood_group,
            }
            status, result = dispatch_stock(payload)
            if status not in (200, 201):
                continue
            center = kit.centers.get(item["center_id"])
            db.add(Dispatch(
                id=dispatch_id, request_id=req.id, center_id=item["center_id"],
                center_name=center.name if center else item["center_id"],
                blood_group=item["blood_group"], product=req.product, units=units,
                eta_sim_min=result.get("eta_sim_min"), status="sent", created_sim=sim,
            ))
            req.allocated_units += units
            remaining -= units
            dispatched += units
        if dispatched:
            req.status = "mobilizing" if req.allocated_units < req.units else "mobilizing"
            req.updated_sim = sim
            req.last_event = "stock_dispatched"
            audit(db, sim, req.id, "system", "system", "stock_dispatched", f"{dispatched} واحد از موجودی مراکز تخصیص داده شد", "allocated_units افزایش یافت؛ supplied بدون تغییر")
            db.commit()

        # Re-read after stock dispatches; donor target is the uncovered deficit.
        req = db.get(Request, request_id)
        if req is None:
            return
        remaining = max(0, req.units - req.allocated_units)
        if remaining > 0:
            multiplier = 3.0 if req.urgency == "critical" else (2.5 if req.urgency == "urgent" else 1.5)
            wave = int(math.ceil(remaining * multiplier))
            donor_ids = _pick_donors(db, req, sim, max(1, min(60, wave)))
            sent = 0
            for donor_id in donor_ids:
                row = _send_template(db, req, donor_id, "request_wave", sim)
                if row is not None:
                    sent += 1
            if sent:
                req.status = "mobilizing"
                req.updated_sim = sim
                req.last_event = "donor_wave_sent"
                audit(db, sim, req.id, "system", "system", "donor_wave_sent", f"{sent} دعوت اهدا ارسال شد", "تأمین‌شده بدون تغییر")
            db.commit()
        else:
            req.status = "mobilizing"
            req.updated_sim = sim
            db.commit()


def send_confirmed(db, notif: Notification, sim: float) -> None:
    if notif.confirmed_sent:
        return
    req = db.get(Request, notif.request_id)
    if req is None:
        return
    row = _send_template(db, req, notif.donor_id, "confirmed", sim)
    if row is not None:
        notif.confirmed_sent = True
        db.commit()


def handle_donor_response(db, payload, sim: float) -> None:
    if db.get(DonorEvent, payload.event_id):
        return
    req = get_request(db, payload.request_id)
    notif = db.scalar(select(Notification).where(
        Notification.request_id == req.id, Notification.donor_id == payload.donor_id,
        Notification.template == "request_wave",
    ).order_by(Notification.created_sim.desc()))
    if notif is None:
        rows = db.scalars(select(Notification).where(Notification.request_id == req.id)).all()
        logger.warning(
            "unknown donor-response notification request=%s donor=%s rows=%s",
            req.id, payload.donor_id, [(r.id, r.donor_id, r.template) for r in rows],
        )
        raise ApiError(400, "unknown_notification", "donor was not invited for this request")
    already_donated = _event_count(db, req.id, payload.donor_id, "donated") > 0
    if req.status in TERMINAL or already_donated:
        db.add(DonorEvent(event_id=payload.event_id, request_id=req.id, donor_id=payload.donor_id, event=payload.response, sim_time=sim))
        db.commit()
        return
    if notif.response != payload.response:
        notif.response = payload.response
        notif.updated_sim = sim
        if payload.response == "accepted":
            req.confirmed += 1
            if req.status == "open":
                req.status = "mobilizing"
            req.last_event = "donor_accepted"
            audit(db, sim, req.id, payload.donor_id, "donor", "donor_response", "دعوت اهدا پذیرفته شد", "confirmed +۱؛ supplied بدون تغییر")
        else:
            notif.active = False
            req.last_event = "donor_declined"
            audit(db, sim, req.id, payload.donor_id, "donor", "donor_response", "دعوت اهدا رد شد", "تأمین‌شده بدون تغییر")
    db.add(DonorEvent(event_id=payload.event_id, request_id=req.id, donor_id=payload.donor_id, event=payload.response, sim_time=sim))
    db.commit()
    if payload.response == "accepted":
        send_confirmed(db, notif, sim)


def _event_count(db, request_id: str, donor_id: str, event: str) -> int:
    return int(db.scalar(select(func.count()).select_from(DonorEvent).where(
        DonorEvent.request_id == request_id, DonorEvent.donor_id == donor_id, DonorEvent.event == event,
    )) or 0)


def handle_donor_progress(db, payload, sim: float) -> None:
    if db.get(DonorEvent, payload.event_id):
        return
    req = get_request(db, payload.request_id)
    notif = db.scalar(select(Notification).where(
        Notification.request_id == req.id, Notification.donor_id == payload.donor_id,
        Notification.template == "request_wave",
    ).order_by(Notification.created_sim.desc()))
    if notif is None:
        raise ApiError(400, "unknown_notification", "donor was not invited for this request")
    prior = _event_count(db, req.id, payload.donor_id, payload.event)
    already_donated = _event_count(db, req.id, payload.donor_id, "donated") > 0
    db.add(DonorEvent(event_id=payload.event_id, request_id=req.id, donor_id=payload.donor_id, event=payload.event, sim_time=sim))
    if req.status in TERMINAL or (already_donated and payload.event != "donated"):
        db.commit()
        return
    if prior == 0:
        if payload.event == "en_route":
            req.en_route += 1
            if req.status in ("open", "mobilizing"):
                req.status = "mobilizing"
            req.last_event = "donor_en_route"
            audit(db, sim, req.id, payload.donor_id, "donor", "donor_progress", "اهداکننده در مسیر مرکز است", "en_route +۱؛ supplied بدون تغییر")
        elif payload.event == "arrived":
            req.arrived += 1
            req.last_event = "donor_arrived"
            audit(db, sim, req.id, payload.donor_id, "donor", "donor_progress", "اهداکننده به مرکز رسید", "arrived +۱؛ supplied بدون تغییر")
        elif payload.event == "donated":
            if req.fulfilled >= req.units:
                db.commit()
                return
            if notif.response != "accepted":
                notif.response = "accepted"
                req.confirmed += 1
            req.supplied_units += 1
            req.fulfilled = min(req.units, req.fulfilled + 1)
            notif.active = False
            req.last_event = "donor_donated"
            if req.fulfilled >= req.units:
                req.status = "fulfilled"
            elif req.fulfilled > 0:
                req.status = "partially_fulfilled"
            req.updated_sim = sim
            audit(db, sim, req.id, payload.donor_id, "donor", "donor_donated", "اهدای واقعی ثبت شد", "supplied +۱ و fulfilled +۱")
        elif payload.event in ("screen_fail", "no_show"):
            notif.active = False
            req.last_event = f"donor_{payload.event}"
            audit(db, sim, req.id, payload.donor_id, "donor", "donor_progress", f"رویداد {payload.event} ثبت شد", "supplied بدون تغییر")
        else:
            req.last_event = f"donor_{payload.event}"
    db.commit()
    if req.status == "fulfilled":
        _stop_other_donors(db, req, sim, notif.donor_id)


def _stop_other_donors(db, req: Request, sim: float, exclude: str) -> None:
    rows = db.scalars(select(Notification).where(
        Notification.request_id == req.id, Notification.template == "request_wave",
        Notification.active.is_(True), Notification.donor_id != exclude,
    )).all()
    for row in rows:
        row.active = False
        row.updated_sim = sim
        _send_template(db, req, row.donor_id, "not_needed", sim)
    if rows:
        audit(db, sim, req.id, "system", "system", "donor_wave_stopped", "دعوت اهداکنندگان اضافی متوقف شد", "جلوگیری از تأمین بیش از نیاز")
    db.commit()


def handle_gateway_status(db, payload, sim: float) -> None:
    if db.get(DonorEvent, payload.event_id):
        return
    db.add(DonorEvent(event_id=payload.event_id, request_id=payload.request_id, donor_id=payload.donor_id, event=f"gateway_{payload.status}", sim_time=sim))
    notif = db.get(Notification, payload.notification_id)
    if notif is not None:
        notif.gateway_status = payload.status
        notif.updated_sim = sim
    db.commit()


def list_requests(db) -> list[dict]:
    rows = db.scalars(select(Request).order_by(Request.created_sim.desc())).all()
    return [request_state(row) for row in rows]


def catalog() -> dict:
    kit = load_kit()
    return {
        "hospitals": [
            {"id": h.hospital_id, "name": h.name, "lat": h.lat, "lon": h.lon}
            for h in kit.hospitals.values()
        ],
        "centers": [
            {"id": c.center_id, "name": c.name, "lat": c.lat, "lon": c.lon}
            for c in kit.centers.values()
        ],
        "products": ["red_cells", "platelets", "plasma"],
        "blood_groups": BLOOD_GROUPS,
    }


def list_audit_events(db, limit: int = 200) -> list[dict]:
    rows = db.scalars(
        select(AuditEvent).order_by(AuditEvent.sim_time.desc(), AuditEvent.id.desc()).limit(limit)
    ).all()
    return [{
        "id": a.id, "sim_time": a.sim_time, "request_id": a.request_id,
        "actor": a.actor, "actor_role": a.actor_role, "type": a.type,
        "summary": a.summary, "effect": a.effect,
    } for a in rows]


def list_donors(db, limit: int = 200) -> list[dict]:
    kit = load_kit()
    donor_groups = {d.donor_id: d.blood_group for d in kit.donors}
    notifications = db.scalars(
        select(Notification)
        .where(Notification.template == "request_wave")
        .order_by(Notification.created_sim.desc())
        .limit(limit)
    ).all()
    events = db.scalars(
        select(DonorEvent).order_by(DonorEvent.sim_time.desc())
    ).all()
    latest_event: dict[tuple[str, str], str] = {}
    for event in events:
        latest_event.setdefault((event.request_id, event.donor_id), event.event)
    return [{
        "donor_id": n.donor_id,
        "request_id": n.request_id,
        "blood_group": donor_groups.get(n.donor_id, ""),
        "response": n.response,
        "active": n.active,
        "gateway_status": n.gateway_status,
        "event": latest_event.get((n.request_id, n.donor_id)),
        "created_sim": n.created_sim,
        "updated_sim": n.updated_sim,
    } for n in notifications]


def request_detail(db, request_id: str) -> dict:
    req = get_request(db, request_id)
    dispatches = db.scalars(select(Dispatch).where(Dispatch.request_id == req.id).order_by(Dispatch.created_sim.desc())).all()
    donors = db.scalars(select(Notification).where(Notification.request_id == req.id, Notification.template == "request_wave")).all()
    audits = db.scalars(select(AuditEvent).where(AuditEvent.request_id == req.id).order_by(AuditEvent.sim_time.desc())).all()
    return {
        **request_state(req),
        "dispatches": [{
            "id": d.id, "center_id": d.center_id, "center_name": d.center_name,
            "blood_group": d.blood_group, "product": d.product, "units": d.units,
            "eta_sim_min": d.eta_sim_min, "status": d.status, "created_sim": d.created_sim,
        } for d in dispatches],
        "donors": [{
            "donor_id": n.donor_id, "template": n.template, "gateway_status": n.gateway_status,
            "response": n.response, "active": n.active, "created_sim": n.created_sim,
        } for n in donors],
        "audit": [{
            "id": a.id, "sim_time": a.sim_time, "actor": a.actor, "actor_role": a.actor_role,
            "type": a.type, "summary": a.summary, "effect": a.effect,
        } for a in audits],
    }


def smart_advice(db, request_id: str, sim: float | None = None) -> dict:
    req = get_request(db, request_id)
    sla = load_kit().rules["sla"].get(req.urgency, 240)
    now = sim if sim is not None else gateway_clock()
    elapsed = max(0.0, now - req.created_sim)
    deficit = max(0, req.units - req.fulfilled)
    urgency_weight = {"critical": 100, "urgent": 60, "planned": 25}[req.urgency]
    sla_pressure = min(100, (elapsed / max(sla, 1)) * 100)
    score = round(min(100, urgency_weight * 0.45 + sla_pressure * 0.35 + min(deficit, 20) * 1.0), 1)
    if req.status == "fulfilled":
        action = "درخواست تأمین شده است؛ اقدام اضافی لازم نیست."
    elif req.status in TERMINAL:
        action = "درخواست بسته شده است."
    elif req.allocated_units >= req.units:
        action = "موجودی تخصیص‌یافته کافی است؛ منتظر تأیید تحویل بمانید و دعوت جدید نفرستید."
    elif req.allocated_units > 0:
        action = "پوشش موجودی ناقص است؛ موج محدود اهداکننده برای شکاف باقی‌مانده پیشنهاد می‌شود."
    else:
        action = "موجودی سازگار کافی تخصیص نیافته؛ بررسی موجودی و ارسال موج اهداکننده پیشنهاد می‌شود."
    return {
        "request_id": req.id, "priority_score": score, "urgency": req.urgency,
        "sla_minutes": sla, "elapsed_minutes": round(elapsed, 1), "deficit_units": deficit,
        "recommended_action": action, "explainable": True,
        "factors": [
            {"name": "urgency", "value": urgency_weight, "note": "وزن فوریت رسمی"},
            {"name": "sla_pressure", "value": round(sla_pressure, 1), "note": "نسبت زمان سپری‌شده به SLA"},
            {"name": "deficit", "value": deficit, "note": "کمبود واحد تأمین‌نشده"},
        ],
        "disclaimer": "این خروجی مشورتی و قانون‌محور است و تصمیم پزشکی یا بالینی نیست.",
    }


def smart_priorities(db, sim: float | None = None) -> list[dict]:
    rows = db.scalars(select(Request).where(Request.status.notin_(list(TERMINAL)))).all()
    now = sim if sim is not None else gateway_clock()
    result = [smart_advice(db, row.id, now) for row in rows]
    return sorted(result, key=lambda item: item["priority_score"], reverse=True)


def resolve_sim_time(value: str | None) -> float:
    if value:
        try:
            return float(value)
        except ValueError:
            raise ApiError(400, "validation_error", "X-Sim-Time must be numeric") from None
    return gateway_clock()
