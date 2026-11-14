from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Header, Response
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from .clients import dispatch_stock, inventory_items
from .config import settings
from .data import is_compatible, load_kit
from .db import get_db
from .errors import ApiError
from .models import Dispatch, Request
from .schemas import (
    AmendRequest, Approval, DispatchRequest, DonorProgressCallback,
    DonorResponseCallback, GatewayStatusCallback, NewRequest,
)
from .services import (
    ACTIVATION_LOCK,
    CALLBACK_LOCK,
    amend_request, approve_request, audit, cancel_request, create_request,
    get_request, handle_donor_progress, handle_donor_response,
    handle_gateway_status, list_requests, new_id, request_detail, request_state,
    resolve_sim_time, smart_advice, smart_priorities,
)

router = APIRouter()
DB = Annotated[Session, Depends(get_db)]


def _auth(expected: str):
    def dependency(authorization: Annotated[str | None, Header()] = None) -> None:
        if authorization != f"Bearer {expected}":
            raise ApiError(401, "unauthorized", "missing or invalid bearer token")
    return dependency


hospital_auth = _auth(settings.hospital_token)
coordinator_auth = _auth(settings.coordinator_token)


@router.get("/health")
def health():
    return {"ok": True}


@router.get("/health/ready")
def readiness(db: DB):
    try:
        db.execute(text("SELECT 1"))
        return {"ok": True, "database": "ok"}
    except Exception:
        return JSONResponse(status_code=503, content={"ok": False, "database": "error"})


@router.post("/requests")
def create(
    body: NewRequest,
    db: DB,
    _: Annotated[None, Depends(hospital_auth)],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
    x_sim_time: Annotated[str | None, Header(alias="X-Sim-Time")] = None,
):
    if not idempotency_key or not (1 <= len(idempotency_key) <= 128):
        raise ApiError(400, "validation_error", "Idempotency-Key is required and must be 1..128 chars")
    code, state = create_request(db, body, idempotency_key, resolve_sim_time(x_sim_time))
    return JSONResponse(status_code=code, content=state)


@router.get("/requests")
def all_requests(db: DB, _: Annotated[None, Depends(hospital_auth)]):
    return {"items": list_requests(db)}


@router.get("/requests/{request_id}")
def read_request(request_id: str, db: DB, _: Annotated[None, Depends(hospital_auth)]):
    return request_state(get_request(db, request_id))


@router.get("/requests/{request_id}/detail")
def read_detail(request_id: str, db: DB, _: Annotated[None, Depends(hospital_auth)]):
    return request_detail(db, request_id)


@router.post("/requests/{request_id}/approve")
def approve(
    request_id: str,
    db: DB,
    _: Annotated[None, Depends(coordinator_auth)],
    body: Approval | None = None,
    x_sim_time: Annotated[str | None, Header(alias="X-Sim-Time")] = None,
):
    if body is not None and body.approved is False:
        raise ApiError(409, "approval_rejected", "approval was explicitly rejected")
    return approve_request(db, request_id, resolve_sim_time(x_sim_time))


@router.post("/requests/{request_id}/cancel")
def cancel(
    request_id: str,
    db: DB,
    _: Annotated[None, Depends(hospital_auth)],
    x_sim_time: Annotated[str | None, Header(alias="X-Sim-Time")] = None,
):
    return cancel_request(db, request_id, resolve_sim_time(x_sim_time))


@router.post("/requests/{request_id}/amend")
def amend(
    request_id: str,
    body: AmendRequest,
    db: DB,
    _: Annotated[None, Depends(hospital_auth)],
    x_sim_time: Annotated[str | None, Header(alias="X-Sim-Time")] = None,
):
    return amend_request(db, request_id, body.urgency, resolve_sim_time(x_sim_time))


@router.post("/callbacks/donor-response")
def donor_response(body: DonorResponseCallback, db: DB):
    with CALLBACK_LOCK:
        handle_donor_response(db, body, body.sim_time)
    return {"ok": True}


@router.post("/callbacks/donor-progress")
def donor_progress(body: DonorProgressCallback, db: DB):
    with CALLBACK_LOCK:
        handle_donor_progress(db, body, body.sim_time)
    return {"ok": True}


@router.post("/callbacks/gateway-status")
def gateway_status(body: GatewayStatusCallback, db: DB):
    with CALLBACK_LOCK:
        handle_gateway_status(db, body, body.sim_time)
    return {"ok": True}


@router.get("/inventory")
def inventory(_: Annotated[None, Depends(hospital_auth)]):
    from .clients import gateway_clock

    return {"sim_time": gateway_clock(), "items": inventory_items()}


@router.post("/inventory/dispatch")
def dispatch(
    body: DispatchRequest,
    db: DB,
    _: Annotated[None, Depends(hospital_auth)],
    x_sim_time: Annotated[str | None, Header(alias="X-Sim-Time")] = None,
):
    sim = resolve_sim_time(x_sim_time)
    with ACTIVATION_LOCK:
        return _dispatch_locked(body, db, sim)


def _dispatch_locked(body: DispatchRequest, db: Session, sim: float):
    req = get_request(db, body.request_id)
    if req.status in ("cancelled", "fulfilled", "expired"):
        raise ApiError(409, "invalid_state", f"request is {req.status}")
    if req.product != body.product:
        raise ApiError(422, "product_mismatch", "dispatch product does not match request")
    if not is_compatible(req.product, body.blood_group, req.blood_group):
        raise ApiError(422, "incompatible", "blood group is not compatible")
    existing = db.get(Dispatch, body.dispatch_id)
    if existing is not None:
        same_dispatch = (
            existing.request_id == body.request_id
            and existing.units == body.units
            and existing.center_id == body.center_id
            and existing.product == body.product
            and existing.blood_group == body.blood_group
        )
        if not same_dispatch:
            raise ApiError(409, "dispatch_id_conflict", "dispatch_id already belongs to a different dispatch")
        return JSONResponse(status_code=200, content={
            "dispatch_id": existing.id, "units": existing.units, "eta_sim_min": existing.eta_sim_min,
        })
    remaining = max(0, req.units - req.allocated_units)
    if body.units > remaining:
        raise ApiError(409, "dispatch_exceeds_remaining", f"dispatch exceeds remaining units ({remaining})")
    payload = body.model_dump()
    payload.update(hospital_id=req.hospital_id, recipient_blood_group=req.blood_group)
    status, result = dispatch_stock(payload)
    if status not in (200, 201):
        error = result.get("error", {}) if isinstance(result, dict) else {}
        raise ApiError(status, error.get("code", "dispatch_failed"), error.get("message", "inventory dispatch failed"))
    center = load_kit().centers.get(body.center_id)
    db.add(Dispatch(
        id=body.dispatch_id, request_id=req.id, center_id=body.center_id,
        center_name=center.name if center else body.center_id, blood_group=body.blood_group,
        product=body.product, units=body.units, eta_sim_min=result.get("eta_sim_min"),
        status="sent", created_sim=sim,
    ))
    req.allocated_units += body.units
    if req.status == "open":
        req.status = "mobilizing"
    req.updated_sim = sim
    req.last_event = "stock_dispatched"
    audit(db, sim, req.id, "hospital", "hospital", "stock_dispatched", f"{body.units} واحد ارسال شد", "allocated_units افزایش یافت؛ supplied بدون تغییر")
    db.commit()
    return JSONResponse(status_code=201, content=result)


@router.get("/smart/priorities")
def priorities(
    db: DB,
    _: Annotated[None, Depends(hospital_auth)],
    x_sim_time: Annotated[str | None, Header(alias="X-Sim-Time")] = None,
):
    if not settings.smart_enabled:
        raise ApiError(404, "smart_disabled", "Smart Service is disabled")
    sim = resolve_sim_time(x_sim_time) if x_sim_time else None
    return {"items": smart_priorities(db, sim)}


@router.get("/smart/requests/{request_id}")
def advice(
    request_id: str,
    db: DB,
    _: Annotated[None, Depends(hospital_auth)],
    x_sim_time: Annotated[str | None, Header(alias="X-Sim-Time")] = None,
):
    if not settings.smart_enabled:
        raise ApiError(404, "smart_disabled", "Smart Service is disabled")
    sim = resolve_sim_time(x_sim_time) if x_sim_time else None
    return smart_advice(db, request_id, sim)
