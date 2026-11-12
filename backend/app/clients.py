from __future__ import annotations

import time
from typing import Any

import httpx

from .config import settings

TIMEOUT = httpx.Timeout(4.0, connect=2.0)


def _request(method: str, url: str, **kwargs) -> tuple[int, dict[str, Any], dict[str, str]]:
    last: tuple[int, dict[str, Any], dict[str, str]] = (503, {"error": {"code": "unavailable", "message": "service unavailable"}}, {})
    for attempt in range(5):
        try:
            response = httpx.request(method, url, timeout=TIMEOUT, **kwargs)
            try:
                body = response.json()
            except ValueError:
                body = {}
            if response.status_code not in (429, 503):
                return response.status_code, body, dict(response.headers)
            last = response.status_code, body, dict(response.headers)
            wait = response.headers.get("Retry-After")
            time.sleep(min(float(wait) if wait else 1.0, 5.0))
        except httpx.HTTPError as exc:
            last = (503, {"error": {"code": "unavailable", "message": str(exc)}}, {})
            time.sleep(min(0.5 * (attempt + 1), 2.0))
    return last


def gateway_clock() -> float:
    status, body, _ = _request("GET", f"{settings.gateway_url.rstrip('/')}/clock")
    if status == 200 and isinstance(body.get("sim_time"), (int, float)):
        return float(body["sim_time"])
    return 0.0


def send_message(payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    status, body, _ = _request("POST", f"{settings.gateway_url.rstrip('/')}/messages", json=payload)
    return status, body


def inventory_items() -> list[dict[str, Any]]:
    status, body, _ = _request("GET", f"{settings.inventory_url.rstrip('/')}/inventory")
    if status == 200:
        return list(body.get("items", []))
    return []


def dispatch_stock(payload: dict[str, Any]) -> tuple[int, dict[str, Any]]:
    status, body, _ = _request("POST", f"{settings.inventory_url.rstrip('/')}/inventory/dispatch", json=payload)
    return status, body


def travel_minutes(origin: tuple[float, float], destination: tuple[float, float]) -> float | None:
    status, body, _ = _request(
        "GET", f"{settings.travel_url.rstrip('/')}/travel",
        params={"from": f"{origin[0]},{origin[1]}", "to": f"{destination[0]},{destination[1]}"},
    )
    if status == 200 and isinstance(body.get("minutes"), (int, float)):
        return float(body["minutes"])
    return None
