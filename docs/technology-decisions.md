# تصمیم‌های فنی Backend و Frontend

**وضعیت:** `DECIDED — IMPLEMENTED (CORE/DEMO COMPLETE)`
**تاریخ:** 2026-11-14
**مبنای تصمیم:** الزامات رسمی `participant_kit/openapi.yaml`، `SERVICES.md`،
`DATA_CARD.md`، سندهای `bloodnet-planning/02-requirements/` و
`bloodnet-planning/03-architecture/`، و محدودیت اجرای محلی چالش.

این سند انتخاب‌های قطعی فنی را ثبت می‌کند. Frontend و Backend هر دو در همین
شاخه پیاده‌سازی شده‌اند. وضعیت واقعی، شواهد آزمون و شکاف‌های باقی‌مانده در
`docs/backend-final-status.md` ثبت شده است؛ این سند فقط انتخاب‌ها و قواعد
فنی را نگه می‌دارد.

## 1. Frontend

| مورد | انتخاب قطعی | نسخه |
|---|---|---|
| Runtime | Node.js | `24.20.0` |
| Package manager | npm | `11.19.0` |
| UI library | React + React DOM | `19.3.1` |
| Language | TypeScript (strict) | `5.9.3` |
| Build tool | Vite | `8.3.8` |
| Vite React plugin | `@vitejs/plugin-react` | `6.3.0` |
| CSS utility | Tailwind CSS + `@tailwindcss/vite` | `4.3.5` |
| Component system | Mantine (`core`, `hooks`, `form`, `notifications`) | `9.8.0` |
| Routing | React Router DOM | `7.18.5` |
| Icons | Phosphor Icons React | `2.1.10` |
| Persian font | Vazirmatn Variable via Fontsource | `5.3.0` |
| Date/time | `Intl` مرورگر | بدون dependency |
| Charts | CSS/SVG سبک | بدون dependency |

### دلایل انتخاب

- React + TypeScript برای تطابق با معماری تأییدشده و کاهش خطای قرارداد API.
- Vite سریع‌ترین مسیر اجرای محلی و Build ساده برای تیم دو نفره است.
- Mantine برای Form، Modal، Notification، AppShell و دسترس‌پذیری آماده؛
  Tailwind برای Layout و توکن‌های اختصاصی.
- Vazirmatn تنها فونت فارسی انتخاب‌شده است تا اعداد، برچسب‌ها و متن RTL
  یکدست باشند.
- هیچ کتابخانه Chart سنگینی اضافه نمی‌شود؛ نمودارهای ساده با CSS/SVG
  ساخته می‌شوند تا حجم Bundle و ریسک اجرا کم بماند.

### تنظیمات قطعی

- `dir="rtl"` و `lang="fa"` روی `<html>`.
- Mantine `DirectionProvider` با `direction="rtl"` و `MantineProvider`.
- ترتیب CSS Layers:
  `@layer theme, base, mantine, components, utilities;`
- Tailwind 4 از طریق `@tailwindcss/vite` و ایمپورت `tailwindcss`.
- Dev server روی `5173`؛ Proxy مسیر `/api` به `http://localhost:8000`
  با حذف پیشوند `/api`.
- `VITE_API_BASE=/api` به‌صورت پیش‌فرض؛ حالت Live پیش‌فرض است و توکن‌ها با
  `VITE_HOSPITAL_TOKEN` / `VITE_COORDINATOR_TOKEN` تنظیم می‌شوند.
- در حالت Demo/Fallback، State در `localStorage` با کلید `bloodnet-demo-v1`
  نگه داشته می‌شود و کاملاً برچسب `DEMO` دارد.
- در حالت Live، Adapter قراردادمحور Endpointهای رسمی را صدا می‌زند. برای
  نیازهای خواندنی UI، Endpointهای محصولی `/requests` (List)،
  `/requests/{id}/detail`، `/catalog`، `/audit` و `/donors` اضافه شده‌اند؛
  این‌ها Extensionهای خواندنی خارج از OpenAPI رسمی‌اند و Endpointهای قرارداد
  را تغییر نمی‌دهند. Smart Service نیز طبق `DECLARED.md` دو Endpoint
  مشورتی `/smart/priorities` و `/smart/requests/{id}` دارد.

## 2. Backend

| مورد | انتخاب قطعی | نسخه |
|---|---|---|
| Language | Python | `3.14.7` |
| API framework | FastAPI | `0.162.5` |
| ASGI server | Uvicorn | `0.54.0` |
| ORM | SQLAlchemy (sync) | `2.1.8` |
| Database | SQLite (WAL) | bundled |
| Migration | Alembic | `1.20.1` |
| Validation/settings | Pydantic + pydantic-settings | `2.14.3` / `2.x` |
| HTTP client | httpx | `0.28.1` |
| Tests | pytest | `9.2.0` |

### دلایل انتخاب

- FastAPI مستقیماً OpenAPI را می‌فهمد و برای پیاده‌سازی قرارداد رسمی،
  validation، callback و تست سریع مناسب است.
- SQLite برای اجرای محلی چالش، بدون Docker و بدون سرویس خارجی، ساده‌ترین
  گزینه قابل توضیح است. WAL، `foreign_keys=ON` و `busy_timeout` فعال می‌شوند.
- SQLAlchemy 2.1 + Alembic امکان مهاجرت بعدی به PostgreSQL را بدون بازنویسی
  مدل‌ها نگه می‌دارد.
- معماری Sync انتخاب شده تا تراکنش‌های `BEGIN IMMEDIATE` برای Dispatch
  اتمی و FEFO ساده و قابل‌آزمون باشند. FastAPI endpointهای Sync را در
  threadpool اجرا می‌کند.
- یک سرویس FastAPI روی `8000` و اختیاری یک Outbox Worker از همان codebase.
  Mockهای رسمی روی `9100` (Gateway)، `9200` (Travel) و `9300` (Inventory)
  اجرا می‌شوند. Frontend در Production می‌تواند از همان FastAPI سرو شود.

### قواعد اجباری پیاده‌سازی Backend

- `Idempotency-Key` با طول ۱ تا ۱۲۸، هش بدنه و پاسخ replay؛ کلید تکراری با
  بدنه متفاوت باید `422` بدهد.
- `event_id` در Callbackها یکتا و idempotent باشد.
- `dispatch_id` یکتا و idempotent باشد؛ Stock فقط در تراکنش موفق کم شود.
- FEFO بر اساس `expires_sim_min` / `expires_at` و فقط از موجودی سازگار.
- ETA = ۱۰ دقیقه شبیه‌سازی پردازش + زمان سفر مرکز تا بیمارستان.
- فقط رویداد `donated` موجودی تأمین‌شده را افزایش می‌دهد.
- ساعت شبیه‌سازی از `GET /clock` Gateway خوانده شود، نه ساعت سیستم.
- Auth با توکن‌های Demo از Environment؛ `hospitalBearer` و
  `coordinatorBearer`؛ هیچ رمز واقعی در مخزن نیست.
- Audit Trail برای همه تغییرهای State و Dispatch الزامی است.
- Retry محدود برای `429`/`503` با احترام به `Retry-After`.

### وضعیت پیاده‌سازی و محدودیت‌ها

- Backend با `28` تست واحد و `15/15` تست قرارداد تأیید شده است.
- قفل‌های Process-level، نبود Scheduler انقضای خودکار، تعهد اتمی اهداکننده،
  کنترل تعلیق نزدیک ارسال، پوشش کامل Audit/Retry و `defer_until` صریح از
  شکاف‌های باقی‌مانده‌اند. جزئیات در `docs/backend-final-status.md`.
- SQLite برای Demo محلی انتخاب شده است. در بار زیاد یا چند Writer واقعی،
  PostgreSQL مسیر تولیدی است. این محدودیت در README و راهنمای اجرا ذکر می‌شود.

## 3. Smart Service

Smart Service به‌صورت یک ماژول اختیاری و **قاعده‌محور** پیاده‌سازی شده است؛
بدون LLM، بدون تصمیم پزشکی و پشت Feature Flag `SMART_ENABLED`. خروجی آن
فقط Advisory است و هیچ State یا موجودی را تغییر نمی‌دهد. Endpointهای
`GET /smart/priorities` و `GET /smart/requests/{id}` در `DECLARED.md`
اعلام شده‌اند. این Endpointها Extension مشورتی خارج از OpenAPI رسمی‌اند و
Endpointهای قرارداد را تغییر نمی‌دهند.

## 4. مرزهای ثابت

- منابع `participant_kit/`، `harness/`، `examples/` و `tests/` بدون تغییر
  می‌مانند.
- `main_cloned/` فقط‌خواندنی است.
- هیچ Token، Password، Private Key یا `.env` واقعی Commit نمی‌شود.
- Force Push و History Rewrite ممنوع است.
- هر Commit باید بلافاصله Push شود؛ در غیر این صورت وضعیت
  `COMMIT CREATED — PUSH PENDING` گزارش می‌شود.
