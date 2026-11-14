from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .db import ensure_schema
from .errors import ApiError, api_error_handler, validation_error_handler
from .middleware import RequestIDMiddleware, valid_request_id
from .routers import router

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_schema()
    yield


app = FastAPI(
    title="BloodNet API",
    version="1.0.0",
    description="Blood donation coordination backend for the BloodNet contest scenario. Synthetic data only.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)
app.add_middleware(RequestIDMiddleware)

app.add_exception_handler(ApiError, api_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, _exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    if not request_id:
        request_id = valid_request_id(request.headers.get("X-Request-ID")) or uuid4().hex
    headers = {"X-Request-ID": request_id}
    origin = request.headers.get("origin")
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "internal_error", "message": "internal server error"}},
        headers=headers,
    )


app.include_router(router)
