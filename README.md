# BloodNet — مرکز فرمان هماهنگی اهدای خون

**وضعیت:** Frontend به API واقعی متصل شده و در نبود API به حالت Demo برمی‌گردد؛ هسته Backend پیاده‌سازی و تست شده است.

- مخزن عمومی: `https://github.com/MrMR-711/bloodnet`
- Branch پیش‌فرض: `main`
- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`

## محصول چیست؟

BloodNet جریان هماهنگی اهدای خون را از ثبت درخواست بیمار تا تخصیص موجودی، دعوت اهداکننده و ثبت اهدا نمایش می‌دهد. رابط کاربری فارسی و RTL است و به‌صورت پیش‌فرض داده‌های زنده را از API می‌خواند؛ اگر API در دسترس نباشد، همان تجربه با داده نمایشی محلی ادامه پیدا می‌کند. Backend قرارداد API، ایدمپوتنسی، تخصیص FEFO، رزرو موجودی برای درخواست‌های بحرانی و قواعد ایمنی را پیاده کرده است.

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
- Scheduler انقضای خودکار و Observability کامل باقی مانده است.
- Smart Service توصیه‌ای و قاعده‌محور است، نه تشخیص پزشکی.
- نتیجه Smoke به Seed و سناریو وابسته است. دو اجرای Seed 4000 با کد نهایی امتیازهای 95.7 و 98.8 و Critical SLA برابر 1.0 دادند؛ Seed 4001 با همان کد 70.5 و Critical SLA برابر 0.333 داد.
- در Seed 4001، یک درخواست Critical پلاکت O+ به‌دلیل نبود موجودی سازگار و زمان ۹۰ دقیقه‌ای Apheresis از نظر فیزیکی در SLA 90 دقیقه‌ای قابل تحقق نبود؛ این محدودیت داده/فرایند است، نه تأخیر پردازش.

## Git

- Branch کاری Backend: `backend`
- Branch کاری Frontend: `frontend`
- ادغام روی `main`
- Force Push و بازنویسی تاریخ ممنوع است.
- هیچ Token یا `.env` واقعی در مخزن ذخیره نمی‌شود.

## منابع

- [`backend/README.md`](backend/README.md)
- [`frontend/README.md`](frontend/README.md)
- [`docs/technology-decisions.md`](docs/technology-decisions.md)
- [`participant_kit/openapi.yaml`](participant_kit/openapi.yaml)
