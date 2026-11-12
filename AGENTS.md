# دستورالعمل محصول BloodNet

## نقش و مرز محیط

این پوشه مخزن مستقل محصول است. برنامه‌ریزی در
`../prompt_workspace/bloodnet-planning/` انجام می‌شود و منابع رسمی فقط از
`../main_cloned/` خوانده می‌شوند.

- `main_cloned` فقط‌خواندنی است؛ Reset، Clean، Commit و Push روی آن ممنوع است.
- تغییرات محصول فقط در همین مخزن انجام شود.
- `.git` هیچ محیط دیگری به این مخزن کپی نشود.
- Remote مسابقه به این مخزن وصل نشود.

## وضعیت فعلی

`SKELETON ONLY — IMPLEMENTATION NOT STARTED`

در این مرحله Backend، Frontend، API اجرایی، Database، Schema، Migration،
UI واقعی و Smart Service ساخته نمی‌شوند. معماری Backend بدون تأیید نهایی تیم
قطعی نیست.

## Branchها و هویت

| نقش | Branch | `user.name` | `user.email` |
|---|---|---|---|
| Backend | `backend` | `MrMR-711` | `mohammad117811@gmail.com` |
| Frontend | `frontend` | `Reza-zahedi` | `zahdireza6327@gmail.com` |
| ادغام | `main` | مالک واقعی ادغام | پس از تأیید |

- توسعه روزمره مستقیم روی `main` ممنوع است.
- هویت Author/Committer با حساب احراز هویت Push یکی نیست؛ هر دو جدا کنترل شوند.
- Email هر عضو باید در حساب GitHub متناظر تأیید شده باشد.
- هر Commit با هویت واقعی همان عضو و پیام فارسی/Finglish ثبت شود.

## چرخه اجباری هر تغییر

1. بررسی Branch جاری و Working Tree.
2. بررسی Git Identity همان Branch.
3. مشخص‌کردن منبع رسمی، Requirement/AC و مالک تغییر.
4. اجرای تست یا Validation مرتبط.
5. ارائه توضیح فارسی/Finglish و Explainability Gate.
6. Commit کوچک و تک‌موضوعی.
7. Push فوری به Remote همان Branch.
8. بررسی خروجی واقعی Push و همگامی Remote.
9. ثبت گزارش کوتاه Branch، Commit، Push و تست.

تا مرحله ۸ کامل نشود، وضعیت `COMMIT CREATED — PUSH PENDING` است و کار
تکمیل‌شده گزارش نمی‌شود. Force Push و History Rewrite ممنوع است.

## قالب پیام Commit

- `feat(backend): افزودن اعتبارسنجی درخواست`
- `fix(frontend): اصلاح نمایش وضعیت درخواست`
- `test(backend): افزودن آزمون همزمانی موجودی`
- `docs: تکمیل راهنمای اجرای محلی`

پیام‌های مبهم مانند `update` یا `changes` مجاز نیستند.

## امنیت و Secret

- Token، PAT، Password، Private Key و `.env` واقعی ذخیره یا Commit نشود.
- فقط `.env.example` عمومی مجاز است.
- خروجی واقعی Git ملاک گزارش موفقیت Commit/Push است.
- `main_cloned` را برای رفع تفاوت CRLF/LF Reset یا Clean نکنید.

## منابع رسمی

- قرارداد API: `participant_kit/openapi.yaml`
- قواعد داده و سازگاری: `participant_kit/rules.yaml` و `compat.yaml`
- Harness: `harness/`
- تست عمومی کیت: `tests/validate_public_kit.py`
- منشأ و Hash: `SOURCE-PROVENANCE.md`

فایل‌های رسمی کیت بدون منبع و Hash تغییر نکنند. `starter/` مرجع آموزشی است
و کپی یا تبدیل آن به محصول مجاز نیست.
