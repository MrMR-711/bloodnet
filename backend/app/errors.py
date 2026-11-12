from __future__ import annotations

from fastapi import Request
from fastapi.responses import JSONResponse


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        self.status_code = status_code
        self.code = code
        self.message = message
        super().__init__(message)


def error_body(code: str, message: str) -> dict:
    return {"error": {"code": code, "message": message}}


async def api_error_handler(_request: Request, exc: ApiError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=error_body(exc.code, exc.message))


async def validation_error_handler(_request: Request, exc) -> JSONResponse:
    errors = exc.errors() if hasattr(exc, "errors") else []
    message = errors[0].get("msg", "invalid request") if errors else "invalid request"
    return JSONResponse(status_code=400, content=error_body("validation_error", message))
