# BloodNet — Frontend

رابط کاربری فارسی و RTL برای هماهنگی اهدای خون. این بخش به‌صورت پیش‌فرض داده‌ها را از API واقعی می‌خواند و
اقدام‌ها را به Backend می‌فرستد؛ اگر API در دسترس نباشد، برای حفظ تجربه نمایشی به `localStorage` برمی‌گردد.

> داده‌ها ساختگی‌اند و این محصول مشاوره یا تصمیم پزشکی ارائه نمی‌دهد.

## پشته فنی

| ابزار | نسخه | نقش |
|---|---|---|
| React / React DOM | `19.3.1` | رابط کاربری |
| TypeScript | `5.9.3` | تایپ استاتیک |
| Vite | `8.3.8` | توسعه و build |
| Tailwind CSS | `4.3.5` | utility و توکن‌های ظاهری |
| Mantine | `9.8.0` | کامپوننت‌های دسترس‌پذیر و RTL |
| React Router DOM | `7.18.5` | مسیربندی |
| Phosphor Icons | `2.1.10` | آیکون‌های برداری |
| Vazirmatn Variable | `5.3.0` | فونت فارسی |

## اجرا

```bash
cd frontend
npm install
npm run dev
```

توسعه روی `http://localhost:5173` اجرا می‌شود. مسیر `/api` در Vite به `http://localhost:8000` پروکسی می‌شود
و پیشوند `/api` حذف می‌شود.

```bash
npm run typecheck
npm run build
npm run preview
```

## متغیرهای محیط

```env
VITE_API_BASE=/api
VITE_HOSPITAL_TOKEN=hospital-token
VITE_COORDINATOR_TOKEN=coordinator-token
```

هیچ توکن، رمز عبور، PAT یا کلید خصوصی واقعی در Frontend ذخیره نمی‌شود. توکن‌های دمو در قرارداد رسمی مقدار
ثابت دارند و راز واقعی نیستند.

## معماری

```
src/
├── components/      # AppLayout، کارت‌ها، نشان‌ها، جدول درخواست‌ها
├── data/            # seed نمایشی و Store هیبرید Live/Demo
├── lib/             # API Client، برچسب‌ها، قالب‌بندی تاریخ/عدد، شناسه‌ها
├── pages/           # داشبورد، درخواست‌ها، موجودی، اهداکننده، audit، راهنما
├── styles/          # Tailwind 4 + لایه‌های Mantine + توکن‌ها
├── types/           # انواع دامنه و ماتریس سازگاری رسمی
├── App.tsx          # مسیرها
├── main.tsx         # RTL، Mantine، Notifications، Store
└── theme.ts         # تم Mantine و پالت برند
```

### مسیرها

- `/` — داشبورد عملیات و شاخص‌ها
- `/requests` — فهرست و فیلتر درخواست‌ها
- `/requests/new` — ثبت درخواست جدید
- `/requests/:requestId` — جزئیات، پنج کمیت، اقدام‌ها و timeline
- `/inventory` — موجودی مراکز، FEFO و dispatch
- `/donor` — پورتال اهداکننده و گذارهای مجاز
- `/audit` — گزارش رویدادها و خروجی JSON
- `/guide` — راهنمای فنی و قرارداد

## قواعد دامنه‌ای که در UI رعایت شده‌اند

- پنج کمیت مستقل با برچسب‌های جدا: مقدار درخواستی، موجودی سازگار قابل تخصیص، مقدار تخصیص‌یافته، مقدار
  واقعاً تأمین‌شده و مقدار باقی‌مانده.
- فقط رویداد `donated` مقدار تأمین‌شده را افزایش می‌دهد. پذیرش دعوت، حرکت، رسیدن، غربالگری، تخصیص موجودی
  و تحویل پیام Gateway اهدا محسوب نمی‌شوند.
- محصولات فقط `red_cells`، `platelets` و `plasma` هستند. فیلد رسمی `product` است و `product_type` ارسال
  نمی‌شود.
- وضعیت‌های رسمی: `pending_review`، `open`، `mobilizing`، `partially_fulfilled`، `fulfilled`، `cancelled`
  و `expired`.
- تخصیص موجودی با FEFO، بررسی سازگاری از `participant_kit/compat.yaml` و expiry انجام می‌شود.
- برای ثبت درخواست، `Idempotency-Key` با طول مجاز 1 تا 128 ساخته و نمایش داده می‌شود.
- زمان‌ها بر مبنای ساعت شبیه‌سازی و epoch `2027-01-15T00:00:00+03:30` نمایش داده می‌شوند.

## حالت نمایشی و حالت زنده

`DemoStoreContext` یک Store هیبرید است. در حالت زنده، درخواست‌ها، موجودی، کاتالوگ، Audit و اهداکنندگان را از
`/api` می‌خواند و هر ۱۵ ثانیه همگام می‌کند. ثبت درخواست، تأیید/لغو/اصلاح، تخصیص موجودی و رویدادهای اهداکننده
همه به API ارسال می‌شوند. اگر API در دسترس نباشد، همان رابط با داده نمایشی `localStorage` و نشانگر شفاف
«حالت نمایشی محلی» ادامه پیدا می‌کند.

Endpointهای مورد استفاده: `/health`، `/requests`، `/requests/{id}/detail`، `/inventory`،
`/inventory/dispatch`، `/catalog`، `/audit`، `/donors` و Callbackهای اهداکننده. نام نمایشی اهداکنندگان در
حالت زنده از شناسه ساخته می‌شود، چون کیت عمومی نام تماس ندارد.

## دسترس‌پذیری و RTL

- `<html lang="fa" dir="rtl">` و `DirectionProvider` Mantine
- فونت Vazirmatn و اعداد فارسی در نمایش
- برچسب فرم‌ها، پیام خطا، `aria-live` برای تغییرات مهم، فوکوس قابل مشاهده
- حداقل هدف لمسی 44 پیکسل، کنتراست متن و احترام به `prefers-reduced-motion`
- جدول‌ها در موبایل به کارت تبدیل می‌شوند و شناسه‌های فنی LTR نمایش داده می‌شوند

## تصمیم‌های Backend (مستند، بدون پیاده‌سازی)

Python `3.14.7`، FastAPI `0.162.5`، Uvicorn `0.54.0`، SQLAlchemy `2.1.8`، SQLite با WAL و
`foreign_keys`، Alembic `1.20.1`، Pydantic `2.14.3`، httpx `0.28.1` و pytest `9.2.0`. سرویس محصول روی
پورت `8000` و Mockها روی `9100`/`9200`/`9300` اجرا می‌شوند. SQLite برای دموی محلی انتخاب شده و مسیر مهاجرت
به PostgreSQL باید مستند شود. جزئیات در `../docs/technology-decisions.md`.

Smart Service به‌صورت یک ماژول مشورتی قطعی و قابل توضیح بر پایه قواعد، بدون LLM و بدون تصمیم پزشکی پیاده‌سازی
شده است. خروجی آن توصیه عملیاتی است و جای ارزیابی بالینی را نمی‌گیرد.

## مستندات

- `../docs/technology-decisions.md`
- `../docs/git-workflow.md`
- `../participant_kit/openapi.yaml`
- `../participant_kit/compat.yaml`
