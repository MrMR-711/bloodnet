# گردش کار Git تیم — BloodNet

**وضعیت:** `CONFIRMED — REMOTE CONFIGURED — AUTH VERIFIED`

## ۱. Branchها

| Branch | نقش | مالک | `user.name` | `user.email` |
|---|---|---|---|---|
| `main` | ادغام و نسخه پایدار | `MrMR-711` | `MrMR-711` | `mohammad117811@gmail.com` |
| `backend` | توسعه Backend | `MrMR-711` | `MrMR-711` | `mohammad117811@gmail.com` |
| `frontend` | توسعه Frontend | `Reza-zahedi` | `Reza-zahedi` | `zahdireza6327@gmail.com` |

- هر دو Branch کاری در همین Repository مشترک هستند؛ دو مخزن جدا ساخته نمی‌شود.
- توسعه مستقیم روزمره روی `main` ممنوع است؛ ادغام نهایی و Commitهای مستندات
  با هماهنگی روی `main` انجام می‌شوند.
- `main` شاخهٔ مرجع فعلی است. `backend` در `f324684` و `frontend` در
  `04814c7` قرار دارند؛ `backend` از Remote خود ۱۲ Commit جلوتر است و
  `frontend` با Remote هم‌سطح است. جزئیات در بخش ۶.

## ۲. هویت Commit در برابر احراز هویت Push

این دو مفهوم مستقل‌اند:

- **Author/Committer** با `user.name` و `user.email` تعیین می‌شود.
- **Push Authentication** با حساب GitHub، Credential Helper یا SSH Key تعیین می‌شود.

Git به‌صورت بومی Identity مخصوص هر Branch ندارد. استقلال واقعی از یکی از
این راه‌ها تأمین می‌شود:

1. هر عضو روی Clone محلی خودش Identity سراسری یا Local مخصوص خود را تنظیم کند.
2. در یک ماشین مشترک، برای Commit عضو دیگر از Override صریح استفاده شود:

```bash
git -c user.name="Reza-zahedi" \
    -c user.email="zahdireza6327@gmail.com" \
    commit -m "feat(frontend): ..."
```

3. برای جداسازی کامل، می‌توان از Worktreeهای مستقل با `includeIf` بر اساس
   مسیر استفاده کرد. این گزینه فعلاً انتخاب نشده است.

در این محیط، Identity پیش‌فرض مخزن `MrMR-711` است و Commitهای `frontend`
باید با Override بالا ثبت شوند. Email باید در حساب متناظر GitHub تأیید شده باشد.

## ۳. Remoteهای تنظیم‌شده

| Branch | Remote | URL | حساب Push تأییدشده |
|---|---|---|---|
| `main` | `origin` | `https://github.com/MrMR-711/bloodnet.git` | `MrMR-711` |
| `backend` | `origin-backend` | `https://github.com/MrMR-711/bloodnet.git` | `MrMR-711` |
| `frontend` | `origin-frontend` | `https://github.com/MrMR-711/bloodnet.git` | `reza-zahedi6327` |

`origin-backend` و `origin-frontend` URL یکسان دارند؛ تفکیک آن‌ها منطقی است و
احراز هویت هر Push با تغییر حساب فعال `gh` کنترل می‌شود. Remote مسابقه هرگز
Remote محصول نمی‌شود.

## ۴. روش احراز هویت

### HTTPS با GitHub CLI

```bash
gh auth status
gh auth switch --user MrMR-711
gh auth switch --user reza-zahedi6327
```

- `credential.https://github.com.helper` به `gh auth git-credential` تنظیم شده است.
- پیش از Push هر Branch، حساب فعال باید با مالک همان Branch مطابق باشد.
- Token خام در فایل پروژه ذخیره نمی‌شود.

### گزینه SSH

اگر بعداً کلیدها ساخته شوند:

```text
Host github-backend
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_backend
  IdentitiesOnly yes

Host github-frontend
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_frontend
  IdentitiesOnly yes
```

Private Key هرگز داخل مخزن یا Workspace ذخیره نمی‌شود. در وضعیت فعلی
`~/.ssh/config` و کلید خصوصی وجود ندارد؛ این گزینه `NOT USED` است.

## ۵. چرخه اجباری هر تغییر

1. `git branch --show-current`
2. `git status --short`
3. بررسی `user.name` و `user.email` همان Branch
4. بررسی Diff و منبع رسمی/Requirement/AC
5. اجرای تست مرتبط
6. Commit کوچک با پیام فارسی یا Finglish
7. Push فوری به Remote همان Branch
8. بررسی خروجی واقعی Push
9. ثبت گزارش کوتاه

اگر Push شکست خورد:

- خطا دقیق گزارش شود.
- وضعیت `COMMIT CREATED — PUSH PENDING` اعلام شود.
- Force Push و History Rewrite ممنوع است.
- Commitهای جدید تا رفع مشکل انباشته نشوند.

## ۶. وضعیت فعلی

**ثبت‌شده پیش از Commit نهایی مستندات؛ Commit جدید در گزارش پایانی اعلام می‌شود.**

| مورد | وضعیت |
|---|---|
| Local Repository | `INITIALIZED` |
| Initial Commit | `d7d307d` — `CREATED AND PUSHED` |
| `main` / `origin/main` | `93e97d5` — هم‌سطح |
| Branch `backend` | `f324684` — ۱۲ Commit جلوتر از `origin-backend/backend` |
| Branch `frontend` | `04814c7` — هم‌سطح `origin-frontend/frontend` |
| شاخهٔ مرجع | `main` — شامل Backend و Frontend |
| Remoteها | `origin` / `origin-backend` / `origin-frontend` — `CONFIGURED` |
| Auth Owner (`MrMR-711`) | `VERIFIED` |
| Auth Teammate (`reza-zahedi6327`) | `VERIFIED` |
| Collaboration Invite | `ACCEPTED — WRITE` |
| Push `main` / `frontend` | `VERIFIED` |
| Push `backend` | آخرین Push قدیمی‌تر از `f324684` است؛ `origin-backend` عقب است |

Branchهای `backend` و `frontend` تاریخی‌اند و برای تحویل، `main` مرجع است.
هیچ Force Push یا History Rewrite انجام نشده است.
