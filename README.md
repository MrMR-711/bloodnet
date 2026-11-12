# BloodNet — مخزن مستقل محصول

**وضعیت:** `FRONTEND DEMO IMPLEMENTED — BACKEND DECIDED, NOT IMPLEMENTED`

این مخزن، مخزن مشترک محصول تیم برای چالش BloodNet است. Frontend واقعی با
React، Tailwind CSS، Mantine، فارسی و RTL ساخته شده و در حالت نمایشی با داده
محلی اجرا می‌شود. پشته Backend تصمیم‌گیری و مستند شده است، اما هیچ API
اجرایی، Database، Migration یا جریان واقعی Backend هنوز ساخته نشده است.

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
├── backend/            # تصمیم‌ها و Placeholder؛ بدون کد اجرایی
├── frontend/           # اپلیکیشن React + Tailwind + Mantine (حالت نمایشی)
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

Frontend در حالت نمایشی قابل اجراست:

```bash
cd frontend
npm install
npm run dev
```

رابط روی `http://localhost:5173` بالا می‌آید. داده‌ها در `localStorage` شبیه‌سازی
می‌شوند و هیچ درخواستی به Backend واقعی ارسال نمی‌شود. جزئیات در
[`frontend/README.md`](frontend/README.md) آمده است.

Backend هنوز اجرایی نیست. تصمیم‌های قطعی آن در
[`docs/technology-decisions.md`](docs/technology-decisions.md) ثبت شده‌اند. دستورهای
موجود در منابع کیت برای Practice و Harness هستند و اجرای محصول محسوب نمی‌شوند.

## قواعد کلیدی

- هیچ Token، Password، Private Key یا `.env` واقعی در مخزن ذخیره نمی‌شود.
- Remote مسابقه هرگز به این مخزن وصل نمی‌شود.
- URL مخزن حدس زده نمی‌شود.
- Force Push و History Rewrite ممنوع است.
- هر Commit باید کوچک، تک‌موضوعی و با پیام فارسی یا Finglish باشد.
- هر Commit باید فوراً Push شود؛ در صورت شکست:
  `COMMIT CREATED — PUSH PENDING`.
