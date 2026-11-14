from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine, event, inspect
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings

REQUIRED_TABLES = {
    "requests",
    "idempotency_records",
    "dispatches",
    "notifications",
    "donor_events",
    "audit_events",
}

if settings.database_url.startswith("sqlite:///"):
    Path(settings.database_url.removeprefix("sqlite:///")).parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})


@event.listens_for(engine, "connect")
def _sqlite_pragmas(dbapi_connection, _record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA busy_timeout=5000")
    cursor.close()


SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def ensure_schema() -> None:
    """Fail fast when the database has not been migrated yet."""
    tables = set(inspect(engine).get_table_names())
    missing = sorted(REQUIRED_TABLES - tables)
    if missing:
        raise RuntimeError(
            "Database schema is not initialized (missing tables: "
            + ", ".join(missing)
            + "). Run `alembic upgrade head` from the backend directory. "
            "For a legacy database created before Alembic, run `alembic stamp head` once."
        )
