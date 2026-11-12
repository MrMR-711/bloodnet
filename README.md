# BloodNet — مخزن مستقل محصول

**وضعیت:** `SKELETON ONLY — IMPLEMENTATION NOT STARTED`

این مخزن، مخزن مشترک محصول تیم برای چالش BloodNet است. در این مرحله فقط
محیط Git، ساختار پوشه‌ها و منابع عمومی رسمی آماده شده‌اند. هیچ Backend،
Frontend، API اجرایی، Database، Migration یا UI واقعی ساخته نشده است.

## دامنه فعلی

- مخزن مستقل محصول در مسیر `../bloodnet/` نسبت به ریشه Workspace.
- Branch ادغام: `main`.
- Branch کاری Backend: `backend` — مالک: `MrMR-711`.
- Branch کاری Frontend: `frontend` — مالک: `Reza-zahedi`.
- منابع رسمی فقط از `../main_cloned/` خوانده می‌شوند؛ آن پوشه فقط‌خواندنی است.
- توسعه مستقیم روزمره روی `main` ممنوع است.

## Remote

- URL: `https://github.com/MrMR-711/bloodnet`
- Visibility: `Private`
- Default Branch: `main`
- Branchهای موجود: `main`، `backend`، `frontend`

## ساختار پیشنهادی

```text
bloodnet/
├── backend/            # محل کد Backend (فعلاً فقط Placeholder)
├── frontend/           # محل کد Frontend (فعلاً فقط Placeholder)
├── docs/               # مستندات Bootstrap، Git و وضعیت محیط
├── participant_kit/    # منابع رسمی کپی‌شده بدون تغییر
├── harness/            # Harness رسمی کپی‌شده بدون تغییر
├── examples/           # نمونه‌های رسمی کپی‌شده بدون تغییر
├── tests/              # تست‌های عمومی کیت
├── AGENTS.md
├── SOURCE-PROVENANCE.md
└── README.md
```

## هویت Commit و Branch

| نقش | Branch | `user.name` | `user.email` |
|---|---|---|---|
| Backend | `backend` | `MrMR-711` | `mohammad117811@gmail.com` |
| Frontend | `frontend` | `Reza-zahedi` | `zahdireza6327@gmail.com` |
| ادغام | `main` | مالک واقعی عملیات ادغام | پس از تأیید |

هویت Author و حساب احراز هویت Push دو مفهوم جدا هستند. هر Commit باید با
هویت واقعی همان عضو ثبت و بلافاصله به Remote همان Branch Push شود. Commit
بدون Push، کار تکمیل‌شده محسوب نمی‌شود.

جزئیات در [`docs/git-workflow.md`](docs/git-workflow.md) آمده است.

## منابع رسمی

منابع عمومی کیت با محتوای بدون تغییر از `../main_cloned/` کپی شده‌اند.
منشأ، Commit مرجع و SHA-256 در [`SOURCE-PROVENANCE.md`](SOURCE-PROVENANCE.md)
ثبت شده است.

موارد زیر عمداً کپی نشده‌اند:

- `starter/` — مرجع آموزشی است، نه محصول.
- PDFهای رسمی — برای Runtime لازم نیستند.
- `Dockerfile.example` و `docker-compose.example.yml` — Docker الزام محصول نیست.
- `CHALLENGE.md` — در منبع وجود ندارد و بازسازی نمی‌شود.

## اجرا

در این مرحله محصول اجرایی وجود ندارد. راهنمای اجرای محلی فقط پس از تأیید
معماری و پیاده‌سازی محصول نوشته می‌شود. دستورهای موجود در منابع کیت برای
Practice و Harness هستند و اجرای محصول محسوب نمی‌شوند.

## قواعد کلیدی

- هیچ Token، Password، Private Key یا `.env` واقعی در مخزن ذخیره نمی‌شود.
- Remote مسابقه هرگز به این مخزن وصل نمی‌شود.
- URL مخزن حدس زده نمی‌شود.
- Force Push و History Rewrite ممنوع است.
- هر Commit باید کوچک، تک‌موضوعی و با پیام فارسی یا Finglish باشد.
- هر Commit باید فوراً Push شود؛ در صورت شکست:
  `COMMIT CREATED — PUSH PENDING`.
