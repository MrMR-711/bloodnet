from __future__ import annotations

import re
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from .config import settings

REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")


def valid_request_id(value: str | None) -> str | None:
    if value and REQUEST_ID_PATTERN.fullmatch(value):
        return value
    return None


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach a request id to every response, preserving a valid caller id."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = valid_request_id(request.headers.get(settings.request_id_header)) or uuid4().hex
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers[settings.request_id_header] = request_id
        return response
