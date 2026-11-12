from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class Request(Base):
    __tablename__ = "requests"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    hospital_id: Mapped[str] = mapped_column(String(32), index=True)
    hospital_name: Mapped[str] = mapped_column(String(200), default="")
    blood_group: Mapped[str] = mapped_column(String(8))
    product: Mapped[str] = mapped_column(String(24))
    units: Mapped[int] = mapped_column(Integer)
    urgency: Mapped[str] = mapped_column(String(16))
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="pending_review", index=True)
    created_sim: Mapped[float] = mapped_column(Float, default=0)
    updated_sim: Mapped[float] = mapped_column(Float, default=0)
    approved_sim: Mapped[float | None] = mapped_column(Float, nullable=True)
    allocated_units: Mapped[int] = mapped_column(Integer, default=0)
    supplied_units: Mapped[int] = mapped_column(Integer, default=0)
    confirmed: Mapped[int] = mapped_column(Integer, default=0)
    en_route: Mapped[int] = mapped_column(Integer, default=0)
    arrived: Mapped[int] = mapped_column(Integer, default=0)
    fulfilled: Mapped[int] = mapped_column(Integer, default=0)
    last_event: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class IdempotencyRecord(Base):
    __tablename__ = "idempotency_records"

    key: Mapped[str] = mapped_column(String(128), primary_key=True)
    body_hash: Mapped[str] = mapped_column(String(64))
    request_id: Mapped[str] = mapped_column(String(64))
    status_code: Mapped[int] = mapped_column(Integer)
    response_json: Mapped[str] = mapped_column(Text)


class Dispatch(Base):
    __tablename__ = "dispatches"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    request_id: Mapped[str] = mapped_column(String(64), ForeignKey("requests.id"), index=True)
    center_id: Mapped[str] = mapped_column(String(32))
    center_name: Mapped[str] = mapped_column(String(200), default="")
    blood_group: Mapped[str] = mapped_column(String(8))
    product: Mapped[str] = mapped_column(String(24))
    units: Mapped[int] = mapped_column(Integer)
    eta_sim_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="sent")
    created_sim: Mapped[float] = mapped_column(Float, default=0)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    request_id: Mapped[str] = mapped_column(String(64), ForeignKey("requests.id"), index=True)
    donor_id: Mapped[str] = mapped_column(String(32), index=True)
    template: Mapped[str] = mapped_column(String(24))
    gateway_status: Mapped[str] = mapped_column(String(24), default="queued")
    response: Mapped[str | None] = mapped_column(String(24), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    confirmed_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    created_sim: Mapped[float] = mapped_column(Float, default=0)
    updated_sim: Mapped[float] = mapped_column(Float, default=0)


class DonorEvent(Base):
    __tablename__ = "donor_events"

    event_id: Mapped[str] = mapped_column(String(80), primary_key=True)
    request_id: Mapped[str] = mapped_column(String(64), index=True)
    donor_id: Mapped[str] = mapped_column(String(32), index=True)
    event: Mapped[str] = mapped_column(String(24))
    sim_time: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sim_time: Mapped[float] = mapped_column(Float, index=True)
    request_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    actor: Mapped[str] = mapped_column(String(100))
    actor_role: Mapped[str] = mapped_column(String(32))
    type: Mapped[str] = mapped_column(String(64), index=True)
    summary: Mapped[str] = mapped_column(String(500))
    effect: Mapped[str] = mapped_column(String(500), default="")
