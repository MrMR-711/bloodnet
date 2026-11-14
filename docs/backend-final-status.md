# وضعیت نهایی Backend — BloodNet

**تاریخ:** 2026-11-14
**وضعیت:** `CORE/DEMO COMPLETE — PRODUCTION HARDENING GAPS REMAIN`
**مبنا:** `participant_kit/openapi.yaml`، `SERVICES.md`، `DATA_CARD.md`،
`bloodnet-planning/02-requirements/` و `bloodnet-planning/03-architecture/`.

## خلاصه

هستهٔ Backend قرارداد اصلی API را پیاده کرده، با Frontend زنده کار می‌کند و
برای Demo و داوری آماده است. این سند ادعای «تکمیل کامل Production» نمی‌کند:
چند الزام planning در سطح hardening هنوز باز هستند و در بخش «شکاف‌ها» ثبت
شده‌اند. ادعای تکمیل فقط برای دامنه‌ای است که در همین سند شاهد اجرایی دارد.

## شواهد آزمون

| بررسی | فرمان | نتیجه |
|---|---|---|
| تست Backend | `backend\.venv\Scripts\python.exe -m pytest tests -q` | `28 passed, 32 warnings in 8.55s` |
| تست قرارداد | `python -m harness.contract_tests --team http://127.0.0.1:8001` | `15/15 passed` |
| Typecheck فرانت‌اند | `npm run typecheck` | موفق |
| Build فرانت‌اند | `npm run build` | موفق؛ فقط هشدار Chunk بزرگ‌تر از ۵۰۰kB |
| اعتبارسنجی کیت | `python tests/validate_public_kit.py` | `PASS` — `donors=20000 hospitals=14 centers=5 requests=8152 responses=207486` |
| Runtime زنده | Proxy روی `http://localhost:5173/api` | `health=True requests=4 hospitals=14 centers=5 inventory=31` |

تست قرارداد روی نمونهٔ ایزولهٔ `127.0.0.1:8001` با دیتابیس تازهٔ
`bloodnet_contract.db` و Mockهای تمرینی اجرا شد تا دادهٔ Runtime زنده آلوده
نشود.

### Smoke

آخرین Smokeهای ثبت‌شده با همین کد نهایی Backend:

| Seed | امتیاز | Critical SLA | توضیح |
|---|---|---|---|
| `4000` | `95.7` | `1.0` | اجرای کامل P-normal |
| `4000` | `98.8` | `1.0` | اجرای دوم همان Seed |
| `4001` | `70.5` | `0.333` | یک درخواست Critical پلاکت O+ از نظر فیزیکی در SLA ۹۰ دقیقه‌ای قابل تحقق نبود |

این اعداد شاهد تاریخی ثبت‌شده‌اند، نه اجرای تازه در همین به‌روزرسانی. Smoke
به Seed، سناریو و زمان‌بندی Harness وابسته است و امتیاز Practice، امتیاز
رسمی داوری نیست.

## دامنهٔ پیاده‌شده

| حوزه | وضعیت | شاهد |
|---|---|---|
| قرارداد API، Auth دمو، اعتبارسنجی `product`/`units` | پیاده‌شده | `28` تست Backend و `15/15` تست قرارداد |
| Idempotency ثبت درخواست، Callback و Dispatch | پیاده‌شده | تست‌های Replay، `event_id` و `dispatch_id` |
| چرخهٔ State و Counterهای رسمی | پیاده‌شده | `pending_review` تا `fulfilled`/`cancelled`، پنج کمیت و Audit |
| Inventory جاری، FEFO، ETA، رزرو موجودی بحرانی | پیاده‌شده | Dispatch واقعی، فیلتر ETA و تست‌های رزرو |
| انتخاب اهداکننده، دعوت Gateway، Callbackهای مستقل | پیاده‌شده | Notification پایدار و رویدادهای جداگانه |
| تعلیق اهداکننده بر اساس آخرین Event | پیاده‌شده در زمان انتخاب | `donor_eligible` و `rules.yaml` |
| Audit Trail و Endpointهای خواندنی UI | پیاده‌شده برای رویدادهای کلیدی | `/audit`، `/donors`، `/catalog` |
| Smart Service قاعده‌محور | پیاده‌شده | `/smart/priorities` و `/smart/requests/{id}`؛ `DECLARED.md` |
| Alembic، Readiness و `X-Request-ID` | پیاده‌شده | Migration اولیه، `/health/ready` و تست Middleware |
| Frontend زنده با Fallback نمایشی | پیاده‌شده | Typecheck/Build موفق و اتصال Proxy زنده |

## نقشهٔ الزامات

| گروه | وضعیت اجرایی |
|---|---|
| `FR-001..FR-007`، `FR-016..FR-018`، `FR-030`، `FR-041..FR-049` | پیاده‌شده؛ قرارداد، اعتبارسنجی، Inventory، FEFO، ETA و Endpointها |
| `FR-008..FR-015`، `FR-019..FR-024`، `FR-031..FR-036` | پیاده‌شده با شکاف در Expiry خودکار، تعلیق نزدیک ارسال و کامل‌بودن Audit/Retry |
| `FR-025..FR-029` | Auth و Idempotency پیاده‌شده؛ تعهد اتمی چند‌Processی اهداکننده باقی مانده |
| `FR-037..FR-040` | رابط‌های بیمارستان، مرکز، اهداکننده و نمایش خطا پیاده‌شده |
| `NFR-001..NFR-027` | هستهٔ Demo پوشش داده شده؛ Multi-worker، Throughput عددی، Audit کامل و تأیید Clone تازه باقی مانده |
| `AC-001..AC-056` | مسیرهای اصلی قرارداد و UI پوشش دارند؛ `AC-028/029` (Expiry)، `AC-036` (تعهد)، `AC-043/044/045` (تعلیق) و `AC-047` (Audit) کامل نیستند |

## شکاف‌های باقی‌مانده

1. **Expiry خودکار درخواست:** `expired` فقط به‌عنوان State پایانی در Guardها
   وجود دارد؛ Scheduler یا Transition خودکار برای رسیدن درخواست به `expired`
   پیاده نشده است. `AC-028/029` و بخشی از `FR-024` باز است.
2. **تعهد/آزادسازی اتمی اهداکننده:** انتخاب، پذیرش و آزادسازی در یک Process
   با `threading.Lock` مدیریت می‌شوند؛ قفل دیتابیسی یا تراکنش اتمی برای چند
   Worker وجود ندارد. `FR-029`، `AC-036` و `NFR-010` کامل نیستند.
3. **کنترل تعلیق نزدیک ارسال:** `donor_eligible` در زمان انتخاب اهداکننده
   اجرا می‌شود، اما `_send_template` بلافاصله پیش از ارسال واقعی دوباره آن را
   بررسی نمی‌کند و عدم ارسال را به‌صورت ساختاریافته Audit نمی‌کند.
   `FR-033`، `AC-045` و `NFR-014` کامل نیستند.
4. **پوشش کامل Audit/Retry:** تغییرهای کلیدی و بسیاری از Callbackها Audit
   می‌شوند، اما همهٔ تلاش‌های ناموفق ارسال، Retryهای 429/503 و عدم ارسال
   اعلان در Audit ثبت نمی‌شوند. `FR-035`، `AC-047` و `NFR-007/015` کامل نیستند.
5. **Multi-worker و قفل توزیع‌شده:** قفل‌های `threading.Lock` فقط در یک
   Process معتبرند. `NFR-001` و بخشی از `NFR-010` برای استقرار چند‌Worker
   کامل نیست.
6. **Retry/Recovery پایدار:** Retry محدود و احترام به `Retry-After` پیاده
   شده، اما Outbox/صف پایدار و بازیابی کامل پس از قطعی سرویس وجود ندارد.
   `FR-032`، `AC-041/042` و `NFR-012` کامل نیستند.
7. **`defer_until` صریح:** تعلیق از آخرین Event و `rules.yaml` مشتق می‌شود؛
   فیلد ذخیره‌شدهٔ صریح `defer_until` و قاعدهٔ مرز برابری زمان وجود ندارد.
8. **Throughput و Clone تازه:** اندازهٔ دادهٔ کیت اعتبارسنجی شده، اما آزمون
   بار عددی و راه‌اندازی تأییدشده از Clone تازه انجام نشده است.
   `NFR-008/023` تأیید کامل ندارند.
9. **Endpointهای خارج از قرارداد رسمی:** برای UI و Smart Service،
   Endpointهای خواندنی `/requests` (List)، `/requests/{id}/detail`،
   `/catalog`، `/audit`، `/donors`، `/smart/priorities` و
   `/smart/requests/{id}` اضافه شده‌اند. Endpointهای قرارداد تغییر نکرده‌اند،
   اما این‌ها Extensionهای محصول‌اند و باید در تحویل به‌عنوان خروج از دامنهٔ
   «فقط Endpointهای رسمی» اعلام شوند.
10. **SQLite و Auth دمو:** SQLite برای Demo مناسب است؛ Production به
    PostgreSQL، Backup/Pooling و Auth واقعی نیاز دارد. Auth فعلی Demo Token
    است و OAuth2/OIDC، Rate Limit و امضای Callback ندارد.

## نتیجه

Backend برای Demo، داوری و اتصال زندهٔ UI «آماده» است، اما برای Production
«کامل» نیست. هر ادعای تکمیل باید به همین شکاف‌ها و شواهد آزمون محدود بماند.
