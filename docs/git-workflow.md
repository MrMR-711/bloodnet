# گردش کار Git تیم — BloodNet

**وضعیت:** `DESIGN CONFIRMED — REMOTE/AUTH PENDING`

## ۱. Branchها

| Branch | نقش | مالک | `user.name` | `user.email` |
|---|---|---|---|---|
| `main` | ادغام و نسخه پایدار | مالک واقعی Merge | پس از تأیید | پس از تأیید |
| `backend` | توسعه Backend | `MrMR-711` | `MrMR-711` | `mohammad117811@gmail.com` |
| `frontend` | توسعه Frontend | `Reza-zahedi` | `Reza-zahedi` | `zahdireza6327@gmail.com` |

- هر دو Branch کاری در همین Repository مشترک هستند؛ دو مخزن جدا ساخته نمی‌شود.
- توسعه مستقیم روزمره روی `main` ممنوع است.
- تا آماده‌شدن Remote و احراز هویت، Branch کاری و Commit اولیه ساخته نمی‌شود.

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

هیچ Commitی نباید با Identity حدسی یا نادرست ثبت شود. Email باید در حساب
متناظر GitHub تأیید شده باشد.

## ۳. Remoteهای طراحی‌شده

| Branch | Remote نام منطقی | حساب Push |
|---|---|---|
| `backend` | `origin-backend` | `MrMR-711` |
| `frontend` | `origin-frontend` | `Reza-zahedi` |
| `main` | `origin` | مالک واقعی Merge |

`origin-backend` و `origin-frontend` می‌توانند URL یکسان داشته باشند؛ اما
احراز هویت هر Push باید مستقل تأیید شود. Remote مسابقه هرگز Remote محصول
نمی‌شود.

## ۴. روش احراز هویت

### گزینه HTTPS با GitHub CLI

```bash
gh auth login
gh auth status
gh auth switch
```

- `gh auth switch` حساب فعال را تغییر می‌دهد.
- پیش از Push هر Branch، حساب فعال باید با مالک همان Branch مطابق باشد.
- Credential Helper نباید Token خام را در فایل پروژه ذخیره کند.

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
`~/.ssh/config` و کلید خصوصی وجود ندارد؛ این گزینه `NOT READY` است.

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

| مورد | وضعیت |
|---|---|
| Local Repository | `INITIALIZED` |
| Initial Commit | `NOT CREATED` |
| Remote | `NOT CONFIGURED` |
| Branchهای کاری | `NOT CREATED` |
| Auth Owner (`MrMR-711`) | `NOT AUTHENTICATED` |
| Auth Teammate | `AUTHENTICATED AS reza-zahedi6327` (نیازمند تأیید تطابق) |
| Collaboration Invite | `NOT SENT` |
| Push | `NOT ATTEMPTED` |
