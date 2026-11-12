# Backend — انتخاب فنی، بدون پیاده‌سازی

**وضعیت:** `STACK DECIDED — IMPLEMENTATION NOT STARTED`

این پوشه محل کد Backend محصول است. در این مرحله فقط تصمیم‌های فنی ثبت
شده‌اند؛ هیچ کد، Dependency نصب‌شده، Schema، Migration یا API اجرایی در
مخزن وجود ندارد.

- مالک Branch: `MrMR-711`
- Email: `mohammad117811@gmail.com`
- Language: Python `3.14.7`
- Framework: FastAPI `0.162.5`
- Server: Uvicorn `0.54.0`
- ORM: SQLAlchemy `2.1.8` (sync)
- Database: SQLite با WAL
- Migration: Alembic `1.20.1`
- Validation: Pydantic `2.14.3` + pydantic-settings `2.x`
- HTTP client: httpx `0.28.1`
- Tests: pytest `9.2.0`

جزئیات کامل و دلایل انتخاب در
[`docs/technology-decisions.md`](../docs/technology-decisions.md) آمده است.

## مرز فعلی

- قرارداد عمومی فقط از `participant_kit/openapi.yaml` خوانده می‌شود.
- Endpoint جدید خارج از قرارداد رسمی بدون مستندسازی و تأیید ساخته نمی‌شود.
- Auth با توکن‌های Demo از Environment است؛ رمز یا Secret واقعی در مخزن
  ذخیره نمی‌شود.
- ساعت شبیه‌سازی از Gateway رسمی خوانده می‌شود.
- فقط رویداد `donated` موجودی تأمین‌شده را افزایش می‌دهد.

## پیش‌نیاز پیاده‌سازی بعدی

پیش از افزودن کد اجرایی، باید زمان‌بندی پیاده‌سازی و تأیید معماری نهایی
ثبت شود. این README به‌عنوان تأیید پیاده‌سازی تلقی نمی‌شود.
