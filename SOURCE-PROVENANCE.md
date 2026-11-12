# منشأ منابع رسمی — SOURCE PROVENANCE

**تاریخ کپی:** 2026-11-12

## منبع

| مورد | مقدار |
|---|---|
| مسیر منبع | `../main_cloned/` |
| Remote رسمی | `https://github.com/homoking/Lornux-Challenge-1` |
| Branch | `master` |
| Commit | `18dac4a1ad114a62f666b467faa87ec38ce63bff` |
| وضعیت منبع | فقط‌خواندنی؛ بدون تغییر، Reset، Clean یا Push |

## فایل‌های کپی‌شده

موارد زیر با محتوای بدون تغییر از منبع کپی شده‌اند:

- `participant_kit/`
- `harness/`
- `examples/`
- `tests/`
- `PRACTICE.md`
- `SERVICES.md`
- `PARTICIPANT_README.md`
- `RELEASE_NOTES.md`
- `requirements.txt`
- `.env.example` (نمونه عمومی؛ نه `.env` واقعی)

تعداد فایل‌های کپی‌شده: **۴۶ فایل**.

## تأیید یکسانی محتوا

- SHA-256 هر ۴۶ فایل کپی‌شده با فایل متناظر در `main_cloned` مقایسه شد.
- نتیجه: **۰ تفاوت** (`mismatches=0`).
- فهرست کامل Hashها در [`SOURCE-MANIFEST.sha256`](SOURCE-MANIFEST.sha256) است.
- هیچ `.git` تودرتو کپی نشده است؛ تنها `.git` موجود، مخزن ریشه `bloodnet` است.

## Hash فایل‌های کلیدی

| فایل | SHA-256 |
|---|---|
| `participant_kit/openapi.yaml` | `0933c32bf80a629a6ba7ff0fc895f501aa37fc1a7d32085f974704689dad876f` |
| `participant_kit/compat.yaml` | `eac8a2ed99fdeed3bc4056f7e22d2b1101441255d97eb36e8e175445bbbb036d` |
| `participant_kit/rules.yaml` | `2159b91ddc9b7a1662714838941ae6f0d9a12697ea3383521c7bbcae089e9f18` |
| `participant_kit/donor_events.csv` | `67dd9ed0ff4e152dbc6a719ee6a374e7e6d0d8d63abba48a5ac177008dde5a54` |

## موارد عمداً کپی‌نشده

| مورد | دلیل |
|---|---|
| `starter/` | پیاده‌سازی آموزشی مرجع است و کپی آن با شروع محصول اشتباه می‌شود. |
| `Challenge_Brief.pdf` و `Judging-Brief-FA.pdf` | برای Runtime لازم نیستند؛ مرجع در `main_cloned` و Workspace باقی است. |
| `Dockerfile.example` و `docker-compose.example.yml` | Docker الزام محصول نیست و Topology تأیید نشده است. |
| `SHA256SUMS.txt` | فهرست Hash منبع است؛ فهرست مستقل محصول در `SOURCE-MANIFEST.sha256` ساخته شد. |
| `CHALLENGE.md` | در منبع وجود ندارد؛ بازسازی ممنوع است. |
| `.git/` | هیچ `.git` از منبع کپی نشده است. |

## قاعده نگهداری

فایل‌های رسمی کیت بدون منبع و Hash تغییر نکنند. هر تغییر آینده باید در Branch
مربوطه، با Requirement/AC مشخص و پس از Explainability Gate انجام شود. تغییر
این فایل‌ها نباید باعث ادعای مالکیت یا تغییر قرارداد رسمی شود.
