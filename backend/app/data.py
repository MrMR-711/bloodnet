"""Published kit data: donors, hospitals, centers, compatibility and rules."""
from __future__ import annotations

import csv
from dataclasses import dataclass
from datetime import datetime
from functools import lru_cache
from math import asin, cos, radians, sin, sqrt
from pathlib import Path

import yaml

from .config import settings

EPOCH = datetime(2027, 1, 15, 0, 0)
BLOOD_GROUPS = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"]
PRODUCTS = ["red_cells", "platelets", "plasma"]
DON_TYPE = {"red_cells": 1, "platelets": 2, "plasma": 3}


def _minutes(value: str) -> float | None:
    if not value:
        return None
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is not None:
        dt = dt.replace(tzinfo=None)
    return (dt - EPOCH).total_seconds() / 60.0


@dataclass(frozen=True)
class Hospital:
    hospital_id: str
    name: str
    lat: float
    lon: float
    request_weight: float
    credit_level: str


@dataclass(frozen=True)
class Center:
    center_id: str
    name: str
    lat: float
    lon: float
    beds: int
    open_hour: int
    close_hour: int


@dataclass(frozen=True)
class Donor:
    donor_id: str
    blood_group: str
    sex: str
    age: int
    weight_kg: float
    lat: float
    lon: float
    permanently_excluded: bool
    last_donation_min: float | None
    last_donation_type: str
    last_event: str | None = None
    last_event_min: float | None = None


@dataclass(frozen=True)
class KitData:
    hospitals: dict[str, Hospital]
    centers: dict[str, Center]
    donors: list[Donor]
    compat: dict[str, dict[str, list[str]]]
    rules: dict


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


@lru_cache(maxsize=1)
def load_kit() -> KitData:
    kit = settings.kit_path.resolve()
    hospitals = {
        row["hospital_id"]: Hospital(
            row["hospital_id"], row["name"], float(row["lat"]), float(row["lon"]),
            float(row["request_weight"]), row["credit_level"],
        )
        for row in _read_csv(kit / "hospitals.csv")
    }
    centers = {
        row["center_id"]: Center(
            row["center_id"], row["name"], float(row["lat"]), float(row["lon"]),
            int(row["beds"]), int(row["open_hour"]), int(row["close_hour"]),
        )
        for row in _read_csv(kit / "centers.csv")
    }
    events: dict[str, tuple[str, float]] = {}
    for row in _read_csv(kit / "donor_events.csv"):
        at = _minutes(row["event_at"])
        if at is not None:
            events[row["donor_id"]] = (row["event"], at)
    donors = []
    for row in _read_csv(kit / "donors.csv"):
        event = events.get(row["donor_id"])
        donors.append(Donor(
            row["donor_id"], row["blood_group"], row["sex"], int(row["age"]),
            float(row["weight_kg"]), float(row["lat"]), float(row["lon"]),
            row.get("permanently_excluded") == "1", _minutes(row.get("last_donation_at", "")),
            row.get("last_donation_type", ""), event[0] if event else None, event[1] if event else None,
        ))
    with (kit / "compat.yaml").open(encoding="utf-8") as handle:
        compat = yaml.safe_load(handle)
    with (kit / "rules.yaml").open(encoding="utf-8") as handle:
        rules = yaml.safe_load(handle)
    return KitData(hospitals, centers, donors, compat, rules)


def is_compatible(product: str, donor_group: str, recipient_group: str) -> bool:
    return donor_group in load_kit().compat.get(product, {}).get(recipient_group, [])


def donor_eligible(donor: Donor, product: str, sim_min: float) -> bool:
    rules = load_kit().rules
    if donor.permanently_excluded:
        return False
    if not (rules["age_min"] <= donor.age <= rules["age_max"]):
        return False
    if donor.weight_kg < rules["weight_min_kg"]:
        return False
    day = sim_min / 1440.0
    if donor.last_donation_min is not None:
        last_type = {"": 0, "whole_blood": 1, "platelets": 2, "plasma": 3}.get(donor.last_donation_type, 0)
        target = DON_TYPE[product]
        if last_type:
            same = (
                rules["interval_wb_male"] if donor.sex == "M" else rules["interval_wb_female"]
            ) if target == 1 else rules["interval_apheresis"]
            need = same if last_type == target else rules["cross_block"]
            if day - donor.last_donation_min / 1440.0 < need:
                return False
    if donor.last_event and donor.last_event_min is not None:
        days = rules["event_deferral"].get(donor.last_event, 0)
        if day - donor.last_event_min / 1440.0 < days:
            return False
    return True


def km_between(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * r * asin(sqrt(a))
