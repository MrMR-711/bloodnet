# DECLARED — Smart Service BloodNet

**وضعیت:** `IMPLEMENTED — ADVISORY / RULE-BASED / NO LLM`
**تاریخ:** 2026-11-14
**مرجع:** `NFR-026`، `DR-007` و `DC-007` در
`prompt_workspace/bloodnet-planning/`.

## ۱. این سرویس چیست؟

Smart Service یک ماژول مشورتی قاعده‌محور و Deterministic در همان FastAPI
است. خروجی آن اولویت و توضیح عملیاتی برای درخواست‌هاست؛ هیچ State، موجودی،
تعهد اهداکننده یا Counter را تغییر نمی‌دهد و جای ارزیابی بالینی را نمی‌گیرد.

- LLM، مدل آموزش‌دیده، سرویس ابری یا اتصال پزشکی بیرونی ندارد.
- ورودی آن دادهٔ مصنوعی کیت، State جاری درخواست، Counterها، موجودی جاری و
  زمان شبیه‌سازی است.
- خروجی آن فقط توصیه و دلیل‌های قابل خواندن است.

## ۲. ورودی و خروجی

| مورد | مقدار |
|---|---|
| `GET /smart/priorities` | فهرست اولویت‌بندی‌شدهٔ درخواست‌های فعال |
| `GET /smart/requests/{request_id}` | توصیه و دلیل‌های یک درخواست |
| Auth | `hospitalBearer` مانند سایر Endpointهای خواندنی |
| زمان | `X-Sim-Time` اختیاری؛ در نبود آن `GET /clock` Gateway |
| Feature Flag | `SMART_ENABLED` (پیش‌فرض `true`) |
| تغییر State | ندارد؛ فقط خواندنی |

## ۳. ادغام

- ماژول در `backend/app/services.py` و مسیرها در `backend/app/routers.py`.
- در همان Process و همان دیتابیس Backend اجرا می‌شود؛ سرویس جداگانه یا
  Docker ندارد.
- اگر `SMART_ENABLED=false` باشد، Endpointها `404 smart_disabled` می‌دهند.
- در UI، خروجی به‌عنوان توصیهٔ عملیاتی نمایش داده می‌شود، نه تصمیم قطعی.

## ۴. ارزیابی

| بررسی | شاهد |
|---|---|
| فشار SLA با گذر زمان شبیه‌سازی افزایش می‌یابد | `test_smart_advice_uses_current_simulation_time` |
| خروجی برای درخواست معتبر قابل خواندن و دارای دلیل است | `test_smart_advice` |
| کل Regression Backend | `28 passed` در `backend/tests/test_api.py` |
| قرارداد عمومی | `15/15 passed` در `harness.contract_tests` |

ارزیابی، قاعده‌محور و قابل تکرار است؛ عددی که گزارش می‌شود، امتیاز Practice
یا داوری رسمی نیست.

## ۵. محدودیت‌ها

- خروجی آن توصیهٔ عملیاتی است و مبنای تصمیم پزشکی نیست.
- داده‌ها مصنوعی‌اند و قواعد آن از `rules.yaml` و وضعیت جاری می‌آید.
- کیفیت توصیه به کامل‌بودن State و موجودی جاری وابسته است.
- در شرایط هم‌زمانی چند‌Processی، همان محدودیت قفل‌های Process-level Backend
  را دارد.
- ادعای «هوش مصنوعی» یا «یادگیری ماشین» برای آن مطرح نمی‌شود.

## ۶. دمو

1. Backend را روی `8000` اجرا کنید.
2. با توکن `hospital-token` به `GET /smart/priorities` یا
   `GET /smart/requests/{request_id}` درخواست بدهید.
3. برای تغییر زمان شبیه‌سازی، هدر `X-Sim-Time` را تنظیم کنید.
4. در Swagger (`/docs`) یا UI، توصیه و دلیل‌ها را نشان دهید.

جزئیات وضعیت کلی Backend در `docs/backend-final-status.md` است.
