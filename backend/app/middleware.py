from __future__ import annotations

from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from .config import settings


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach a request id to every response, preserving a caller-supplied id."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get(settings.request_id_header) or uuid4().hex
        response = await call_next(request)
        response.headers[settings.request_id_header] = request_id
        return response
