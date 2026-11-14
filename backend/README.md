# BloodNet Backend

**وضعیت:** `CORE/DEMO COMPLETE — PRODUCTION HARDENING GAPS REMAIN` — هسته Backend پیاده‌سازی و با `28` تست Backend و `15/15` تست قرارداد تأیید شده است. این نسخه برای Demo و داوری آماده است، نه Production کامل.

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

### شواهد آخرین اجرا

| بررسی | نتیجه |
|---|---|
| `backend\.venv\Scripts\python.exe -m pytest tests -q` | `28 passed, 32 warnings in 8.55s` |
| Contract روی نمونهٔ ایزولهٔ `127.0.0.1:8001` با DB تازه | `15/15 passed` |
| `npm run typecheck` / `npm run build` (Frontend) | موفق؛ فقط هشدار Chunk بزرگ‌تر از ۵۰۰kB |
| `python tests/validate_public_kit.py` | `PASS` — `donors=20000 hospitals=14 centers=5 requests=8152 responses=207486` |

Smokeهای ثبت‌شده با کد نهایی: Seed `4000` امتیازهای `95.7` و `98.8` با
`Critical SLA=1.0`؛ Seed `4001` امتیاز `70.5` با `Critical SLA=0.333` به
دلیل یک درخواست Critical پلاکت O+ که از نظر فیزیکی در SLA ۹۰ دقیقه‌ای قابل
تحقق نبود. این اعداد شاهد تاریخی‌اند، نه اجرای تازه یا امتیاز رسمی داوری.

## معماری

- FastAPI + Pydantic برای API و اعتبارسنجی
- SQLAlchemy (sync) + SQLite با WAL
- Alembic برای Migration
- سرویس‌های خارجی Mock: Gateway `:9100`، Travel `:9200`، Inventory `:9300`
- منطق دامنه در `app/services.py`، مسیرها در `app/routers.py`

## قابلیت‌ها

- ثبت درخواست با `Idempotency-Key` و پاسخ تکرارپذیر
- چرخه وضعیت درخواست: `pending_review`، `open`، `mobilizing`، `partially_fulfilled`، `fulfilled`، `cancelled`؛ `expired` فقط به‌عنوان State پایانی در Guardها وجود دارد و Transition خودکار ندارد
- تخصیص موجودی با FEFO برای درخواست‌های planned و اولویت ETA/فاصله برای critical/urgent
- رزرو حداقل یک واحد موجودی برای درخواست بحرانی آینده و دو واحد برای هر درخواست بحرانی در انتظار
- رد واحدهای موجودی دوردستی که ETA آن‌ها از SLA باقی‌مانده بیشتر است
- Dispatch سریال‌شده در یک Process؛ جلوگیری از تخصیص دوباره و تعارض `dispatch_id`
- جلوگیری از Overfill در دو اهدا و Dispatch بیش از باقی‌مانده درخواست
- Callbackهای اهداکننده با `event_id` یکتا و جلوگیری از شمارش دوباره
- فقط رویداد `donated` مقدار `supplied_units` را افزایش می‌دهد
- انتخاب اهداکننده با تاریخچه اهدای دسته‌ای (بدون N+1 Query)
- Smart Service قاعده‌محور و Deterministic با خروجی قابل توضیح
- `X-Request-ID` اعتبارسنجی‌شده روی همه پاسخ‌ها و Readiness Probe
- Endpointهای خواندنی UI: `/catalog`، `/audit`، `/donors`

## محدودیت‌های صادقانه

- قفل‌های `threading.Lock` فقط در یک Process معتبرند؛ برای چند Worker به قفل دیتابیسی/صف نیاز است.
- قفل Dispatch در یک Process نگه داشته می‌شود و I/O خارجی را هم پوشش می‌دهد؛ Production به تراکنش/رزرو اتمی و Timeout کوتاه‌تر نیاز دارد.
- اگر دو اهداکننده هم‌زمان در مسیر باشند، ممکن است اهدای فیزیکی دوم هم ثبت شود؛ شمارنده‌های درخواست از سقف عبور نمی‌کنند و دعوت‌های بعدی متوقف می‌شوند.
- نتیجه Smoke به Seed و سناریو وابسته است. دو اجرای Seed 4000 با کد نهایی: امتیازهای 95.7 و 98.8 و Critical SLA برابر 1.0. Seed 4001 با همان کد: امتیاز 70.5 و Critical SLA برابر 0.333.
- در Seed 4001، درخواست Critical پلاکت O+ به‌دلیل نبود موجودی سازگار و زمان ۹۰ دقیقه‌ای Apheresis در SLA 90 دقیقه‌ای قابل تحقق نبود؛ محدودیت داده و فرایند است، نه کندی Query یا Dispatch.
- SQLite برای Demo مناسب است؛ Production به PostgreSQL، Backup و Pooling نیاز دارد.
- Auth فعلی Demo Token است؛ OAuth2/OIDC، Rate Limit و امضای Callback ندارد.
- Scheduler انقضای خودکار درخواست پیاده نشده است؛ `expired` فقط State پایانی است.
- `donor_eligible` در زمان انتخاب اهداکننده بررسی می‌شود، اما `_send_template` بلافاصله پیش از ارسال واقعی آن را دوباره کنترل نمی‌کند و عدم ارسال را Audit نمی‌کند.
- Audit رویدادهای کلیدی و بسیاری از Callbackها را پوشش می‌دهد، اما همهٔ Retryهای `429/503`، ارسال‌های ناموفق و عدم ارسال‌ها را ثبت نمی‌کند.
- تعهد/آزادسازی اهداکننده در یک Process مدیریت می‌شود و برای چند Worker تراکنش اتمی ندارد.
- فیلد ذخیره‌شدهٔ صریح `defer_until` وجود ندارد؛ تعلیق از آخرین Event و `rules.yaml` مشتق می‌شود.
- آزمون Throughput عددی و راه‌اندازی تأییدشده از Clone تازه انجام نشده است.
- Observability کامل (Metrics/Tracing/Alerting) باقی مانده است.
- Frontend در حالت پیش‌فرض به API وصل است و در نبود آن به داده Demo برمی‌گردد؛ نام نمایشی اهداکنندگان از شناسه ساخته می‌شود.

## منابع

- قرارداد: `../participant_kit/openapi.yaml`
- وضعیت نهایی و شکاف‌ها: `../docs/backend-final-status.md`
- تصمیم‌های فنی: `../docs/technology-decisions.md`
- Smart Service: `../DECLARED.md`
- Harness: `../harness`
