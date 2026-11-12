# وضعیت Bootstrap محیط — BloodNet

**تاریخ:** 2026-11-12
**وضعیت کلی:** `LOCAL SKELETON READY — REMOTE/AUTH PENDING`

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
| حساب فعال | `reza-zahedi6327` (id: `349245355`) |
| پروتکل Git | `https` |
| Scopeها | `gist`, `read:org`, `repo`, `workflow` |
| حساب مالک موردنیاز | `MrMR-711` (id: `190655382`) — وارد نشده |
| مخزن `MrMR-711/bloodnet` | وجود ندارد |

`gh` در `PATH` نیست و باید با مسیر کامل فراخوانی شود. هیچ Token خام در
محیط یا فایل پروژه ذخیره نشده است.

## ۴. وضعیت مخزن محصول

| مورد | وضعیت |
|---|---|
| `git init` | انجام شده با Branch اولیه `main` |
| Commit | ندارد |
| Remote | ندارد |
| Branchهای `backend` / `frontend` | ساخته نشده‌اند |
| Git Identity محلی | هنوز تنظیم نشده |
| Push | انجام نشده |

## ۵. منابع کپی‌شده

- `participant_kit/`، `harness/`، `examples/`، `tests/`
- `PRACTICE.md`، `SERVICES.md`، `PARTICIPANT_README.md`،
  `RELEASE_NOTES.md`، `requirements.txt`، `.env.example`
- تعداد: ۴۶ فایل
- مقایسه SHA-256 با منبع: **۰ تفاوت**
- فهرست: `SOURCE-MANIFEST.sha256`
- توضیح منشأ: `SOURCE-PROVENANCE.md`

## ۶. موانع باقی‌مانده

1. حساب `MrMR-711` در `gh` احراز هویت نشده است؛ ساخت مخزن با مالکیت او
   ممکن نیست.
2. تطابق حساب هم‌تیمی روشن نیست: `Reza-zahedi` در GitHub وجود دارد
   (id: `280507463`)، اما حساب واردشده `reza-zahedi6327`
   (id: `349245355`) است. دعوت باید به حساب صحیح ارسال شود.
3. نام و Visibility مخزن نهایی باید تأیید شود.
4. پس از تأیید، دعوت Collaborator با دسترسی Write ارسال و وضعیت پذیرش
   بررسی می‌شود.
5. Branch/Commit/Push فقط پس از آماده‌شدن Remote و احراز هویت انجام می‌شود.

## ۷. گام بعدی

- احراز هویت `MrMR-711` با `gh auth login` (بدون اشتراک‌گذاری رمز یا Token).
- تأیید حساب هم‌تیمی و ارسال دعوت Write.
- ساخت مخزن با `gh repo create`.
- تنظیم Remoteها، Commit اولیه، Push و سپس Branchهای کاری.
