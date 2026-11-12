import {
  Badge,
  Box,
  Code,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import {
  BookOpen,
  CheckCircle,
  Code as CodeIcon,
  Database,
  Gear,
  Info,
  ShieldCheck,
  WarningCircle,
} from '@phosphor-icons/react';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { InlineMessage } from '../components/StateViews';

const FRONTEND_STACK = [
  ['React / React DOM', '19.3.1', 'کتابخانه رابط کاربری'],
  ['TypeScript', '5.9.3', 'تایپ استاتیک سخت‌گیرانه'],
  ['Vite', '8.3.8', 'ابزار توسعه و build'],
  ['Tailwind CSS', '4.3.5', 'لایه utility و توکن‌ها'],
  ['Mantine', '9.8.0', 'کامپوننت‌های دسترس‌پذیر و RTL'],
  ['React Router DOM', '7.18.5', 'مسیربندی سمت کلاینت'],
  ['Phosphor Icons', '2.1.10', 'آیکون‌های برداری'],
  ['Vazirmatn Variable', '5.3.0', 'فونت فارسی'],
];

const BACKEND_STACK = [
  ['Python', '3.14.7', 'زبان اجرا'],
  ['FastAPI', '0.162.5', 'HTTP API و OpenAPI'],
  ['Uvicorn', '0.54.0', 'سرور ASGI'],
  ['SQLAlchemy', '2.1.8', 'ORM همگام'],
  ['SQLite', 'WAL + foreign_keys', 'پایگاه‌داده محلی دمو'],
  ['Alembic', '1.20.1', 'مهاجرت اسکیما'],
  ['Pydantic', '2.14.3', 'اعتبارسنجی قرارداد'],
  ['httpx', '0.28.1', 'کلاینت سرویس‌های Mock'],
  ['pytest', '9.2.0', 'آزمون‌های قرارداد و دامنه'],
];

const CONTRACT_ROWS = [
  ['POST /requests', 'hospitalBearer + Idempotency-Key', 'ثبت درخواست؛ 201؛ تکرار همان کلید و بدنه 200'],
  ['GET /requests/{id}', 'hospitalBearer', 'خواندن درخواست و شمارنده‌ها'],
  ['POST /requests/{id}/cancel', 'hospitalBearer', 'لغو؛ تکرار 200 بدون اثر'],
  ['POST /requests/{id}/approve', 'coordinatorBearer', 'فقط pending_review؛ وگرنه 409'],
  ['POST /requests/{id}/amend', 'hospitalBearer', 'فقط تغییر urgency؛ وگرنه 409'],
  ['POST /callbacks/donor-response', 'بدون احراز هویت', 'accepted / declined؛ dedupe با event_id'],
  ['POST /callbacks/donor-progress', 'بدون احراز هویت', 'en_route / arrived / screen_pass / screen_fail / donated / no_show'],
  ['POST /callbacks/gateway-status', 'بدون احراز هویت', 'queued / sent / delivered / failed / expired'],
  ['GET /inventory', 'endpoint سرویس موجودی', 'موجودی زنده و expiry'],
  ['POST /inventory/dispatch', 'endpoint سرویس موجودی', 'تخصیص اتمی FEFO؛ 201/200/400/404/409/422'],
];

const FIVE_QUANTITIES = [
  ['مقدار درخواستی', 'units', 'تعداد واحد ثبت‌شده در درخواست (1 تا 20)'],
  ['موجودی سازگار قابل تخصیص', 'compatible allocatable', 'موجودی واقعی مراکز با سازگاری و expiry معتبر'],
  ['مقدار تخصیص‌یافته', 'allocated', 'واحدهایی که dispatch شده‌اند؛ هنوز اهدا نیستند'],
  ['مقدار واقعاً تأمین‌شده', 'supplied', 'فقط با رویداد donated افزایش می‌یابد'],
  ['مقدار باقی‌مانده', 'remaining', 'تفاوت درخواست با مقدار واقعاً تأمین‌شده'],
];

export function GuidePage() {
  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="مرجع محصول"
        title="راهنمای فنی و قرارداد"
        description="تصمیم‌های قطعی فنی، مرزهای قرارداد رسمی، تفاوت دمو با حالت زنده و قواعدی که نباید در UI جابه‌جا شوند."
        actions={
          <Group gap="xs">
            <Badge variant="light" color="teal" leftSection={<CheckCircle size={13} />}>
              تصمیم‌ها ثبت شد
            </Badge>
            <Badge variant="light" color="orange" leftSection={<WarningCircle size={13} />}>
              Backend پیاده‌سازی نشده
            </Badge>
          </Group>
        }
      />

      <InlineMessage tone="info" title="این رابط در حالت نمایشی اجرا می‌شود">
        داده‌ها ساختگی‌اند و در <Code>localStorage</Code> نگهداری می‌شوند. هیچ درخواست شبکه‌ای به Backend واقعی
        ارسال نمی‌شود؛ بنابراین نتیجه‌ها اثبات عملکرد محصول نیستند. حالت زنده فقط پس از پیاده‌سازی Backend و
        اتصال adapter قرارداد فعال می‌شود.
      </InlineMessage>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <SectionCard
          title="پشته Frontend"
          description="انتخاب‌های قطعی و نسخه‌های نصب‌شده"
          action={<CodeIcon size={20} color="#b91c1c" />}
        >
          <Box className="bn-scroll-x">
            <Table striped highlightOnHover verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ابزار</Table.Th>
                  <Table.Th>نسخه</Table.Th>
                  <Table.Th>نقش</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {FRONTEND_STACK.map(([name, version, role]) => (
                  <Table.Tr key={name}>
                    <Table.Td>
                      <Text size="sm" fw={600} className="bn-ltr">
                        {name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Code className="bn-ltr">{version}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {role}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        </SectionCard>

        <SectionCard
          title="پشته Backend"
          description="تصمیم‌شده و مستند؛ هنوز کد اجرایی ندارد"
          action={<Database size={20} color="#be123c" />}
        >
          <Box className="bn-scroll-x">
            <Table striped highlightOnHover verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ابزار</Table.Th>
                  <Table.Th>نسخه / تنظیم</Table.Th>
                  <Table.Th>نقش</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {BACKEND_STACK.map(([name, version, role]) => (
                  <Table.Tr key={name}>
                    <Table.Td>
                      <Text size="sm" fw={600} className="bn-ltr">
                        {name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Code className="bn-ltr">{version}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {role}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
          <Text size="xs" c="dimmed" mt="sm" lh={1.7}>
            SQLite برای سادگی اجرای محلی و دمو انتخاب شده است. مسیر مهاجرت به PostgreSQL و محدودیت تک‌نویسنده
            باید در طراحی Backend مستند شود؛ SQLite جایگزین تصمیم production نیست.
          </Text>
        </SectionCard>
      </SimpleGrid>

      <SectionCard
        title="اجرای محلی"
        description="دستورهای Frontend و قرارداد محیط"
        action={<Gear size={20} color="#b91c1c" />}
      >
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Stack gap="xs">
            <Text size="sm" fw={700}>نصب و توسعه</Text>
            <Code block className="bn-ltr">cd frontend{'\n'}npm install{'\n'}npm run dev</Code>
            <Text size="xs" c="dimmed">
              Vite روی پورت <Code>5173</Code> اجرا می‌شود و <Code>/api</Code> را به <Code>http://localhost:8000</Code>
              {' '}پروکسی می‌کند. Backend هنوز اجرا نمی‌شود.
            </Text>
          </Stack>
          <Stack gap="xs">
            <Text size="sm" fw={700}>ساخت و بررسی</Text>
            <Code block className="bn-ltr">npm run typecheck{'\n'}npm run build{'\n'}npm run preview</Code>
            <Text size="xs" c="dimmed">
              متغیرهای عمومی: <Code>VITE_DEMO_MODE=true</Code> و <Code>VITE_API_BASE_URL=/api</Code>. هیچ
              توکن یا رمزی در Frontend ذخیره نمی‌شود.
            </Text>
          </Stack>
        </SimpleGrid>
      </SectionCard>

      <SectionCard
        title="خلاصه قرارداد رسمی"
        description="فقط endpointهای دارای منبع در OpenAPI کیت"
        action={<BookOpen size={20} color="#be123c" />}
      >
        <Box className="bn-scroll-x">
          <Table striped highlightOnHover verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>مسیر</Table.Th>
                <Table.Th>احراز هویت</Table.Th>
                <Table.Th>نقش و نکته</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {CONTRACT_ROWS.map(([path, auth, note]) => (
                <Table.Tr key={path}>
                  <Table.Td>
                    <Code className="bn-ltr">{path}</Code>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" className="bn-ltr" c={auth.includes('بدون') ? 'dimmed' : undefined}>
                      {auth}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{note}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
        <InlineMessage tone="warning" title="نبود endpoint فهرست درخواست‌ها">
          OpenAPI رسمی endpoint فهرست کامل درخواست‌ها را ندارد. این UI در حالت دمو از داده seed استفاده می‌کند.
          برای حالت زنده باید یک endpoint داخلی یا تجمیع سمت محصول اضافه شود؛ اختراع یک مسیر عمومی بدون منبع
          مجاز نیست.
        </InlineMessage>
      </SectionCard>

      <SectionCard title="پنج کمیت مستقل" description="این پنج عدد را هرگز با هم ادغام نکنید">
        <Box className="bn-scroll-x">
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>برچسب فارسی</Table.Th>
                <Table.Th>نام فنی</Table.Th>
                <Table.Th>معنا</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {FIVE_QUANTITIES.map(([fa, technical, meaning]) => (
                <Table.Tr key={technical}>
                  <Table.Td>
                    <Text size="sm" fw={700}>{fa}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Code className="bn-ltr">{technical}</Code>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">{meaning}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
        <InlineMessage tone="danger" title="قاعده ایمنی تأمین">
          پذیرش دعوت، حرکت، رسیدن، قبولی غربالگری، تخصیص موجودی یا تحویل پیام Gateway هیچ‌کدام اهدا نیستند.
          فقط callback معتبر <Code>donated</Code> مقدار «واقعاً تأمین‌شده» را افزایش می‌دهد.
        </InlineMessage>
      </SectionCard>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <SectionCard title="وضعیت‌های رسمی درخواست">
          <Stack gap="xs">
            {[
              ['pending_review', 'در انتظار بررسی'],
              ['open', 'باز'],
              ['mobilizing', 'در حال بسیج'],
              ['partially_fulfilled', 'تأمین جزئی'],
              ['fulfilled', 'تأمین کامل'],
              ['cancelled', 'لغوشده'],
              ['expired', 'منقضی'],
            ].map(([code, label]) => (
              <Group key={code} justify="space-between">
                <Code className="bn-ltr">{code}</Code>
                <Text size="sm">{label}</Text>
              </Group>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard title="محصولات و رویدادهای اهداکننده">
          <Stack gap="sm">
            <Group gap="xs">
              <Badge variant="light">red_cells</Badge>
              <Badge variant="light">platelets</Badge>
              <Badge variant="light">plasma</Badge>
            </Group>
            <Text size="xs" c="dimmed" lh={1.8}>
              فقط همین سه محصول مجازند؛ فیلد رسمی <Code>product</Code> است و <Code>product_type</Code> هرگز
              ارسال نمی‌شود. گروه‌های خونی: O+, A+, B+, AB+, O-, A-, B-, AB-.
            </Text>
            <Divider />
            <Text size="sm" fw={700}>رویدادهای مسیر اهدا</Text>
            <Text size="xs" c="dimmed" lh={1.8}>
              <Code>accepted</Code>، <Code>en_route</Code>، <Code>arrived</Code>،{' '}
              <Code>screen_pass</Code>، <Code>screen_fail</Code>، <Code>donated</Code>،{' '}
              <Code>no_show</Code> و <Code>declined</Code> مستقل‌اند. Gateway نیز وضعیت‌های{' '}
              <Code>queued</Code>، <Code>sent</Code>، <Code>delivered</Code>، <Code>failed</Code> و{' '}
              <Code>expired</Code> را جدا نگه می‌دارد.
            </Text>
          </Stack>
        </SectionCard>
      </SimpleGrid>

      <SectionCard
        title="دمو در برابر حالت زنده"
        description="مرز صداقت فنی در تحویل"
        action={<Info size={20} color="#B45309" />}
      >
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <Box className="rounded-xl border border-[var(--bn-border)] p-3">
            <Text size="sm" fw={700}>اکنون</Text>
            <Text size="xs" c="dimmed" mt={4} lh={1.75}>
              Store محلی، seed داده، شبیه‌سازی گذارها و audit. هیچ تماس شبکه‌ای یا ذخیره‌سازی سمت سرور وجود
              ندارد.
            </Text>
          </Box>
          <Box className="rounded-xl border border-[var(--bn-border)] p-3">
            <Text size="sm" fw={700}>حالت زنده</Text>
            <Text size="xs" c="dimmed" mt={4} lh={1.75}>
              adapter تایپ‌شده به <Code>VITE_API_BASE_URL</Code>، توکن دمو از محیط، مدیریت 400/401/404/409/422/429/503
              و استفاده از ساعت Gateway.
            </Text>
          </Box>
          <Box className="rounded-xl border border-[var(--bn-border)] p-3">
            <Text size="sm" fw={700}>پیش‌نیاز</Text>
            <Text size="xs" c="dimmed" mt={4} lh={1.75}>
              پیاده‌سازی Backend، endpoint فهرست درخواست‌ها، اتصال callbackها و آزمون قرارداد. تا آن زمان
              ادعای AC-014 کامل نیست.
            </Text>
          </Box>
        </SimpleGrid>
      </SectionCard>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <SectionCard title="امنیت و داده" action={<ShieldCheck size={20} color="#067647" />}>
          <Stack gap="xs">
            <Text size="xs" lh={1.8}>
              توکن‌های <Code>hospitalBearer</Code> و <Code>coordinatorBearer</Code> در دمو مقدار ثابت دارند و
              راز واقعی نیستند. هیچ رمز، PAT، کلید خصوصی یا فایل <Code>.env</Code> در مخزن ذخیره نمی‌شود.
            </Text>
            <Text size="xs" c="dimmed" lh={1.8}>
              داده بیماران ساختگی است. این محصول مشاوره پزشکی نمی‌دهد و نباید برای تصمیم بالینی واقعی استفاده
              شود.
            </Text>
          </Stack>
        </SectionCard>

        <SectionCard title="Smart Service" action={<Info size={20} color="#be123c" />}>
          <Text size="xs" lh={1.8}>
            تصمیم: یک ماژول مشورتی قطعی و قابل توضیح بر پایه قواعد (اولویت، توضیح کمبود و پیشنهاد تخصیص) بدون
            LLM و بدون تصمیم پزشکی. feature-flag می‌شود و در این مرحله پیاده‌سازی نشده است. اگر تحویل داده شود،
            باید <Code>DECLARED.md</Code> و آزمون‌های خودش را داشته باشد.
          </Text>
        </SectionCard>
      </SimpleGrid>

      <SectionCard title="مستندات مرتبط" description="مسیرهای مخزن برای تصمیم‌ها و گردش کار">
        <Stack gap="xs">
          <Text size="sm">
            <Code className="bn-ltr">docs/technology-decisions.md</Code> — تصمیم‌های قطعی Backend و Frontend
          </Text>
          <Text size="sm">
            <Code className="bn-ltr">docs/git-workflow.md</Code> — شاخه‌ها، هویت commit و push
          </Text>
          <Text size="sm">
            <Code className="bn-ltr">participant_kit/openapi.yaml</Code> — قرارداد رسمی
          </Text>
          <Text size="sm">
            <Code className="bn-ltr">participant_kit/compat.yaml</Code> — تنها منبع سازگاری خونی
          </Text>
        </Stack>
        <Divider my="md" />
        <Group gap="xs">
          <Badge variant="light" color="teal">Persian RTL</Badge>
          <Badge variant="light" color="cyan">Accessible</Badge>
          <Badge variant="light" color="orange">Demo mode</Badge>
        </Group>
      </SectionCard>

      <Text size="xs" c="dimmed" ta="center">
        BloodNet — رابط نمایشی هماهنگی اهدای خون. داده‌ها ساختگی و غیرپزشکی هستند.
      </Text>
    </Stack>
  );
}
