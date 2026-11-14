# وضعیت Bootstrap محیط — BloodNet

**تاریخ:** 2026-11-14
**وضعیت کلی:** `ENVIRONMENT READY — CORE/DEMO IMPLEMENTED — PRODUCTION GAPS REMAIN`

## ۱. مسیرهای واقعی

| محیط | مسیر واقعی |
|---|---|
| ریشه Workspace | `C:\Users\K1\Desktop\lornox_project` |
| منبع رسمی | `C:\Users\K1\Desktop\lornox_project\main_cloned` |
| برنامه‌ریزی | `C:\Users\K1\Desktop\lornox_project\prompt_workspace\bloodnet-planning` |
| مخزن محصول | `C:\Users\K1\Desktop\lornox_project\bloodnet` |

## ۲. وضعیت منبع رسمی

| مورد | مقدار |
|---|---|
| Branch | `master` |
| Commit | `18dac4a1ad114a62f666b467faa87ec38ce63bff` |
| Remote | `https://github.com/homoking/Lornux-Challenge-1` |
| وضعیت Working Tree | تمیز |
| `git diff --ignore-cr-at-eol` | خالی |
| دسترسی | فقط‌خواندنی؛ بدون تغییر |

## ۳. وضعیت GitHub CLI

| مورد | مقدار |
|---|---|
| مسیر `gh` | `C:\Program Files\GitHub CLI\gh.exe` |
| نسخه | `2.103.3` |
| حساب فعال | `MrMR-711` (id: `190655382`) |
| حساب دوم | `reza-zahedi6327` (id: `349245355`) |
| پروتکل Git | `https` |
| Credential Helper | `gh auth git-credential` |
| مخزن محصول | `MrMR-711/bloodnet` — Private |
| وضعیت `gh` در PATH | نیست؛ با مسیر کامل فراخوانی می‌شود |

هیچ Token خام، Password یا Private Key در محیط یا فایل پروژه ذخیره نشده است.

## ۴. وضعیت مخزن محصول

| مورد | وضعیت |
|---|---|
| Branch پیش‌فرض | `main` |
| Commit جاری `main` | `93e97d5` — `fix(frontend): مقاوم‌سازی اتصال زنده در قطع سرویس‌های جانبی` |
| `origin/main` | هم‌سطح `93e97d5` |
| Branch `backend` | `f324684` — ۱۲ Commit جلوتر از `origin-backend/backend` |
| Branch `frontend` | `04814c7` — هم‌سطح `origin-frontend/frontend` |
| Remoteها | `origin`، `origin-backend`، `origin-frontend` به URL یکسان |
| Remote URL | `https://github.com/MrMR-711/bloodnet.git` |
| Collaborator | `reza-zahedi6327` با دسترسی `write`؛ دعوت پذیرفته شده |
| وضعیت Working Tree | تمیز (پیش از به‌روزرسانی مستندات) |
| Default Branch | `main` |

`main` شاخهٔ ادغام و مرجع فعلی است. Branchهای `backend` و `frontend` تاریخی‌اند
و ممکن است از `main` عقب باشند؛ جزئیات در `docs/git-workflow.md`.

## ۵. منابع کپی‌شده

- `participant_kit/`، `harness/`، `examples/`، `tests/`
- `PRACTICE.md`، `SERVICES.md`، `PARTICIPANT_README.md`،
  `RELEASE_NOTES.md`، `requirements.txt`، `.env.example`
- تعداد: ۴۶ فایل
- مقایسه SHA-256 با منبع: **۰ تفاوت**
- فهرست: `SOURCE-MANIFEST.sha256`
- توضیح منشأ: `SOURCE-PROVENANCE.md`

## ۶. Validation اجراشده

| بررسی | نتیجه |
|---|---|
| `python tests/validate_public_kit.py` | `PASS` — `donors=20000 hospitals=14 centers=5 requests=8152 responses=207486` |
| `backend\.venv\Scripts\python.exe -m pytest tests -q` | `28 passed, 32 warnings in 8.55s` |
| Contract روی `127.0.0.1:8001` با DB تازه | `15/15 passed` |
| `npm run typecheck` / `npm run build` | موفق؛ فقط هشدار Chunk بزرگ‌تر از ۵۰۰kB |
| مقایسه SHA-256 فایل‌های کیت | `0 mismatches` |
| نبود Secret Pattern | `NO_SECRET_PATTERNS` |
| نبود `.git` تودرتو | فقط `.git` ریشه مخزن |

## ۷. Runtime محلی

| سرویس | آدرس | وضعیت |
|---|---|---|
| Frontend | `http://localhost:5173` | فعال |
| Backend | `http://127.0.0.1:8000` | فعال |
| Gateway Mock | `http://127.0.0.1:9100` | فعال |
| Travel Mock | `http://127.0.0.1:9200` | فعال |
| Inventory Service | `http://127.0.0.1:9300` | فعال |

بررسی Proxy زنده: `health=True requests=4 hospitals=14 centers=5 inventory=31`.

## ۸. موانع باقی‌مانده

1. Scheduler انقضای خودکار درخواست پیاده نشده است؛ `expired` فقط State پایانی است.
2. قفل‌های Process-level برای چند Worker کافی نیستند؛ قفل دیتابیسی/توزیع‌شده لازم است.
3. تعهد/آزادسازی اهداکننده در چند Process اتمی نیست.
4. `donor_eligible` نزدیک ارسال واقعی دوباره بررسی و Audit نمی‌شود.
5. Audit همهٔ Retryها، ارسال‌های ناموفق و عدم ارسال‌ها را پوشش نمی‌دهد.
6. `defer_until` به‌صورت فیلد صریح ذخیره نمی‌شود؛ از آخرین Event و قواعد مشتق می‌شود.
7. آزمون Throughput عددی و راه‌اندازی تأییدشده از Clone تازه انجام نشده است.
8. SQLite و Auth دمو برای Production کافی نیستند؛ PostgreSQL و Auth واقعی لازم است.
9. Endpointهای خواندنی محصول (`/requests`، `/catalog`، `/audit`، `/donors` و
   `/smart/*`) خارج از OpenAPI رسمی‌اند و باید به‌عنوان Extension اعلام شوند.

جزئیات و نقشهٔ FR/NFR/AC در `docs/backend-final-status.md` است.

## ۹. گام بعدی

- Commit و Push همین به‌روزرسانی مستندات روی `main`.
- در صورت نیاز، هم‌سطح‌سازی Branch تاریخی `backend` با `main`.
- شروع hardening تولیدی فقط با اولویت‌بندی صریح: Expiry، قفل توزیع‌شده،
  تعهد اتمی اهداکننده، Audit/Retry و `defer_until`.
