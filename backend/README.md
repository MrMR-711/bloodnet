# BloodNet Backend

**وضعیت:** هسته Backend پیاده‌سازی و تست شده است. این نسخه برای Demo و داوری آماده است، نه Production کامل.

## اجرا

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

اگر دیتابیس قدیمی بدون Alembic ساخته شده است، یک‌بار `alembic stamp head` را اجرا کنید. برنامه در صورت نبود جدول‌ها با پیام واضح متوقف می‌شود و دیگر Schema را خودکار نمی‌سازد.

آدرس‌ها:

- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`
- Readiness: `http://127.0.0.1:8000/health/ready`

## Migration

```bash
alembic upgrade head
```

Migration اولیه در `alembic/versions/20261114_0001_initial.py` قرار دارد.

## تست

```bash
pytest -q
```

تست قرارداد از ریشه مخزن و با اجرای سرور:

```bash
python -m harness.contract_tests --team http://127.0.0.1:8000
```

Smoke نمونه:

```bash
python -m harness.runner --team http://127.0.0.1:8000 --scenario P-normal
```

## معماری

- FastAPI + Pydantic برای API و اعتبارسنجی
- SQLAlchemy (sync) + SQLite با WAL
- Alembic برای Migration
- سرویس‌های خارجی Mock: Gateway `:9100`، Travel `:9200`، Inventory `:9300`
- منطق دامنه در `app/services.py`، مسیرها در `app/routers.py`

## قابلیت‌ها

- ثبت درخواست با `Idempotency-Key` و پاسخ تکرارپذیر
- چرخه وضعیت درخواست: `pending_review`، `open`، `mobilizing`، `partially_fulfilled`، `fulfilled`، `cancelled`
- تخصیص موجودی با FEFO برای درخواست‌های planned و اولویت فاصله برای critical/urgent
- Dispatch سریال‌شده در یک Process؛ جلوگیری از تخصیص دوباره و تعارض `dispatch_id`
- جلوگیری از Overfill در دو اهدا و Dispatch بیش از باقی‌مانده درخواست
- Callbackهای اهداکننده با `event_id` یکتا و جلوگیری از شمارش دوباره
- فقط رویداد `donated` مقدار `supplied_units` را افزایش می‌دهد
- Smart Service قاعده‌محور و Deterministic با خروجی قابل توضیح
- `X-Request-ID` اعتبارسنجی‌شده روی همه پاسخ‌ها و Readiness Probe

## محدودیت‌های صادقانه

- قفل‌های `threading.Lock` فقط در یک Process معتبرند؛ برای چند Worker به قفل دیتابیسی/صف نیاز است.
- قفل Dispatch در یک Process نگه داشته می‌شود و I/O خارجی را هم پوشش می‌دهد؛ Production به تراکنش/رزرو اتمی و Timeout کوتاه‌تر نیاز دارد.
- اگر دو اهداکننده هم‌زمان در مسیر باشند، ممکن است اهدای فیزیکی دوم هم ثبت شود؛ شمارنده‌های درخواست از سقف عبور نمی‌کنند و دعوت‌های بعدی متوقف می‌شوند.
- در Smokeهای محلی، امتیاز بسته به Seed و سناریو بین ۵۶ تا ۹۹ متغیر بود؛ Safety/Overfill/Incompatible در اجرای ۱۲ درخواستی صفر ماند، اما Critical SLA همچنان نقطه ضعف است.
- SQLite برای Demo مناسب است؛ Production به PostgreSQL، Backup و Pooling نیاز دارد.
- Auth فعلی Demo Token است؛ OAuth2/OIDC، Rate Limit و امضای Callback ندارد.
- Scheduler انقضای خودکار درخواست پیاده نشده است.
- Observability کامل (Metrics/Tracing/Alerting) باقی مانده است.
- Frontend فعلاً داده Demo دارد و فقط سلامت API را بررسی می‌کند.

## منابع

- قرارداد: `../participant_kit/openapi.yaml`
- تصمیم‌های فنی: `../docs/technology-decisions.md`
- Harness: `../harness`
