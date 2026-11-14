# BloodNet — مرکز فرمان هماهنگی اهدای خون

**وضعیت:** Frontend Demo کامل؛ هسته Backend پیاده‌سازی و تست شده؛ اتصال کامل داده‌های UI به API باقی مانده است.

- مخزن عمومی: `https://github.com/MrMR-711/bloodnet`
- Branch پیش‌فرض: `main`
- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`

## محصول چیست؟

BloodNet جریان هماهنگی اهدای خون را از ثبت درخواست بیمار تا تخصیص موجودی، دعوت اهداکننده و ثبت اهدا نمایش می‌دهد. رابط کاربری فارسی و RTL است و تجربه کامل را در حالت نمایشی ارائه می‌کند. Backend قرارداد API، ایدمپوتنسی، تخصیص FEFO و قواعد ایمنی را پیاده کرده است.

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

سپس `http://localhost:5173` را باز کنید. نشانگر **API متصل** در هدر، سلامت Backend را هر ۱۵ ثانیه بررسی می‌کند. داده‌های اصلی UI فعلاً Demo و در `localStorage` هستند.

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
- تخصیص FEFO و رزرو موجودی
- جلوگیری از Overfill و تخصیص ناسازگار
- Callbackهای اهداکننده با `event_id` یکتا
- Smart Service قاعده‌محور و قابل توضیح
- `X-Request-ID` و Readiness Probe
- Migration با Alembic

## محدودیت‌ها

- Frontend داده Demo دارد؛ فقط سلامت API متصل است.
- قفل‌های Process-level برای چند Worker کافی نیستند.
- SQLite برای Demo است؛ Production به PostgreSQL و Migration کامل نیاز دارد.
- Auth فعلی Demo Token است.
- Scheduler انقضای خودکار و Observability کامل باقی مانده است.
- Smart Service توصیه‌ای و قاعده‌محور است، نه تشخیص پزشکی.

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
