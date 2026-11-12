from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

BloodGroup = Literal["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"]
Product = Literal["red_cells", "platelets", "plasma"]
Urgency = Literal["critical", "urgent", "planned"]
RequestStatus = Literal[
    "pending_review", "open", "mobilizing", "partially_fulfilled",
    "fulfilled", "cancelled", "expired",
]


class NewRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    hospital_id: str = Field(min_length=1)
    blood_group: BloodGroup
    product: Product
    units: int = Field(ge=1, le=20)
    urgency: Urgency
    note: str | None = Field(default=None, max_length=500)


class AmendRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    urgency: Urgency


class Approval(BaseModel):
    model_config = ConfigDict(extra="forbid")

    approved: bool = True
    note: str | None = Field(default=None, max_length=500)


class DonorResponseCallback(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_id: str = Field(min_length=1, max_length=128)
    request_id: str
    donor_id: str
    notification_id: str | None = None
    response: Literal["accepted", "declined"]
    sim_time: float
    reason: str | None = None


class DonorProgressCallback(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_id: str = Field(min_length=1, max_length=128)
    request_id: str
    donor_id: str
    event: Literal["en_route", "arrived", "screen_pass", "screen_fail", "donated", "no_show"]
    sim_time: float
    reason: str | None = None


class GatewayStatusCallback(BaseModel):
    model_config = ConfigDict(extra="forbid")

    event_id: str = Field(min_length=1, max_length=128)
    notification_id: str
    request_id: str
    donor_id: str
    status: Literal["queued", "sent", "delivered", "failed", "expired"]
    sim_time: float


class DispatchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    dispatch_id: str = Field(min_length=1, max_length=128)
    request_id: str
    center_id: str
    blood_group: BloodGroup
    product: Product
    units: int = Field(ge=1, le=20)
