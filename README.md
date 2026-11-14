# BloodNet — مرکز فرمان هماهنگی اهدای خون

**وضعیت:** `CORE/DEMO COMPLETE — PRODUCTION HARDENING GAPS REMAIN` — Frontend به API واقعی متصل است و در نبود API به حالت Demo برمی‌گردد؛ هسته Backend پیاده‌سازی و با `28` تست Backend و `15/15` تست قرارداد تأیید شده است. این نسخه برای Demo و داوری آماده است، نه Production کامل.

- مخزن عمومی: `https://github.com/MrMR-711/bloodnet`
- Branch پیش‌فرض: `main`
- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`

## محصول چیست؟

BloodNet جریان هماهنگی اهدای خون را از ثبت درخواست بیمار تا تخصیص موجودی، دعوت اهداکننده و ثبت اهدا نمایش می‌دهد. رابط کاربری فارسی و RTL است و به‌صورت پیش‌فرض داده‌های زنده را از API می‌خواند؛ اگر API در دسترس نباشد، همان تجربه با داده نمایشی محلی ادامه پیدا می‌کند. Backend قرارداد API، ایدمپوتنسی، تخصیص FEFO، رزرو موجودی برای درخواست‌های بحرانی و قواعد ایمنی را پیاده کرده است.

## وضعیت فعلی

| بخش | وضعیت |
|---|---|
| Backend | `CORE/DEMO COMPLETE` — `28 passed`، قرارداد `15/15` |
| Frontend | اتصال زندهٔ API با Fallback نمایشی؛ Typecheck و Build موفق |
| Runtime محلی | Frontend `5173`، Backend `8000`، Gateway/Travel `9100/9200`، Inventory `9300` |
| Smart Service | قاعده‌محور و مشورتی؛ `DECLARED.md` |
| Production | کامل نیست؛ شکاف‌های Expiry خودکار، Multi-worker، تعهد اتمی و Audit کامل باز است |

جزئیات و نقشهٔ الزامات در [`docs/backend-final-status.md`](docs/backend-final-status.md) آمده است.

## ساختار

```text
bloodnet/
├── backend/            # FastAPI + SQLAlchemy + Alembic + تست‌ها
├── frontend/           # React + TypeScript + Vite + Mantine + Tailwind
├── docs/               # تصمیم‌های فنی و مستندات
├── participant_kit/    # منابع رسمی چالش
├── harness/            # تست قرارداد و اجرای سناریو
└── examples/           # نمونه‌های رسمی
```

## اجرای Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## اجرای Frontend

```bash
cd frontend
npm install
npm run dev
```

سپس `http://localhost:5173` را باز کنید. UI به‌صورت پیش‌فرض در حالت **داده زنده API** است و هر ۱۵ ثانیه همگام می‌شود. در صورت قطع Backend، پیام حالت نمایشی و داده‌های محلی `localStorage` فعال می‌شوند. آدرس API با `VITE_API_BASE` و توکن‌ها با `VITE_HOSPITAL_TOKEN` / `VITE_COORDINATOR_TOKEN` قابل تغییرند.

## تست

```bash
cd backend
pytest -q
```

از ریشه مخزن، با اجرای سرور:

```bash
python -m harness.contract_tests --team http://127.0.0.1:8000
python -m harness.runner --team http://127.0.0.1:8000 --scenario P-normal
```

شواهد آخرین اجرا:

| بررسی | نتیجه |
|---|---|
| `backend\.venv\Scripts\python.exe -m pytest tests -q` | `28 passed, 32 warnings in 8.55s` |
| Contract روی نمونهٔ ایزولهٔ `127.0.0.1:8001` | `15/15 passed` |
| `npm run typecheck` / `npm run build` | موفق؛ فقط هشدار Chunk بزرگ‌تر از ۵۰۰kB |
| `python tests/validate_public_kit.py` | `PASS` — `donors=20000 hospitals=14 centers=5 requests=8152 responses=207486` |

Smokeهای ثبت‌شده با کد نهایی Backend: Seed `4000` امتیازهای `95.7` و `98.8`
با `Critical SLA=1.0`؛ Seed `4001` امتیاز `70.5` با `Critical SLA=0.333` به
دلیل یک درخواست Critical پلاکت O+ که از نظر فیزیکی در SLA ۹۰ دقیقه‌ای قابل
تحقق نبود. این اعداد شاهد تاریخی‌اند و امتیاز رسمی داوری نیستند.

## قابلیت‌های کلیدی

- ثبت درخواست با `Idempotency-Key`
- تخصیص FEFO و رزرو موجودی برای درخواست‌های بحرانی
- رد موجودی دوردستی که ETA آن از SLA بیشتر است
- جلوگیری از Overfill و تخصیص ناسازگار
- Callbackهای اهداکننده با `event_id` یکتا
- Smart Service قاعده‌محور و قابل توضیح
- `X-Request-ID` و Readiness Probe
- Migration با Alembic
- اتصال کامل UI به API با Fallback نمایشی

## محدودیت‌ها

- در حالت زنده، نام نمایشی اهداکنندگان از شناسه آن‌ها ساخته می‌شود؛ API عمومی کیت نام تماس ندارد.
- قفل‌های Process-level برای چند Worker کافی نیستند.
- SQLite برای Demo است؛ Production به PostgreSQL و Migration کامل نیاز دارد.
- Auth فعلی Demo Token است.
- Scheduler انقضای خودکار درخواست پیاده نشده است؛ `expired` فقط به‌عنوان State پایانی در Guardها وجود دارد.
- تعلیق اهداکننده در زمان انتخاب بررسی می‌شود، اما بلافاصله پیش از ارسال واقعی Notification دوباره کنترل نمی‌شود.
- Audit رویدادهای کلیدی را پوشش می‌دهد، اما همهٔ Retryها، ارسال‌های ناموفق و عدم ارسال‌ها را ثبت نمی‌کند.
- تعهد/آزادسازی اهداکننده در یک Process مدیریت می‌شود و برای چند Worker تراکنش اتمی ندارد.
- فیلد ذخیره‌شدهٔ صریح `defer_until` وجود ندارد؛ تعلیق از آخرین Event و `rules.yaml` مشتق می‌شود.
- Observability کامل (Metrics/Tracing/Alerting) باقی مانده است.
- Smart Service توصیه‌ای و قاعده‌محور است، نه تشخیص پزشکی؛ جزئیات در [`DECLARED.md`](DECLARED.md).
- نتیجه Smoke به Seed و سناریو وابسته است. دو اجرای Seed 4000 با کد نهایی امتیازهای 95.7 و 98.8 و Critical SLA برابر 1.0 دادند؛ Seed 4001 با همان کد 70.5 و Critical SLA برابر 0.333 داد.
- در Seed 4001، یک درخواست Critical پلاکت O+ به‌دلیل نبود موجودی سازگار و زمان ۹۰ دقیقه‌ای Apheresis از نظر فیزیکی در SLA 90 دقیقه‌ای قابل تحقق نبود؛ این محدودیت داده/فرایند است، نه تأخیر پردازش.

## Git

- Branch کاری Backend: `backend` (تاریخی، پشت `main`)
- Branch کاری Frontend: `frontend` (تاریخی)
- Branch پایدار و ادغام: `main`؛ آخرین Commit کد: `93e97d5`
- Force Push و بازنویسی تاریخ ممنوع است.
- هیچ Token یا `.env` واقعی در مخزن ذخیره نمی‌شود.
- جزئیات وضعیت Branchها و Remoteها در [`docs/git-workflow.md`](docs/git-workflow.md) است.

## منابع

- [`backend/README.md`](backend/README.md)
- [`frontend/README.md`](frontend/README.md)
- [`docs/backend-final-status.md`](docs/backend-final-status.md)
- [`docs/technology-decisions.md`](docs/technology-decisions.md)
- [`docs/git-workflow.md`](docs/git-workflow.md)
- [`DECLARED.md`](DECLARED.md)
- [`participant_kit/openapi.yaml`](participant_kit/openapi.yaml)
