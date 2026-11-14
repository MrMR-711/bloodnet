import { useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  NumberInput,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  ArrowsClockwise,
  CheckCircle,
  Drop,
  FirstAidKit,
  Key,
  Lightbulb,
  PaperPlaneTilt,
  ShieldCheck,
} from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { InlineMessage } from '../components/StateViews';
import {
  compatibleInventoryFor,
  compatibleUnitsFor,
  useDemoStore,
} from '../data/DemoStoreContext';
import {
  expiryLabel,
  formatNumber,
  formatUnits,
  isoFromSimMinute,
} from '../lib/format';
import {
  BLOOD_GROUPS,
  PRODUCTS,
  URGENCIES,
  type BloodGroup,
  type Product,
  type Urgency,
} from '../types/domain';
import {
  PRODUCT_LABELS,
  URGENCY_LABELS,
  URGENCY_SLA_MINUTES,
} from '../lib/labels';
import { createIdempotencyKey } from '../lib/ids';

interface FormValues {
  hospital_id: string;
  blood_group: BloodGroup;
  product: Product;
  units: number;
  urgency: Urgency;
  note: string;
}

export function NewRequestPage() {
  const { state, createRequest, hospitals } = useDemoStore();
  const navigate = useNavigate();
  const [idempotencyKey, setIdempotencyKey] = useState(() => createIdempotencyKey());

  const form = useForm<FormValues>({
    initialValues: {
      hospital_id: '',
      blood_group: 'O+',
      product: 'red_cells',
      units: 2,
      urgency: 'urgent',
      note: '',
    },
    validate: {
      hospital_id: (value) => (value ? null : 'بیمارستان درخواست‌دهنده را انتخاب کنید.'),
      units: (value) =>
        typeof value === 'number' && value >= 1 && value <= 20
          ? null
          : 'تعداد واحد باید بین ۱ تا ۲۰ باشد.',
      note: (value) => (value.length <= 500 ? null : 'یادداشت نمی‌تواند بیش از ۵۰۰ نویسه باشد.'),
    },
  });

  const compatibleItems = compatibleInventoryFor(state, {
    product: form.values.product,
    blood_group: form.values.blood_group,
  });
  const compatibleUnits = compatibleUnitsFor(state, {
    product: form.values.product,
    blood_group: form.values.blood_group,
  });
  const nearestItem = compatibleItems[0];
  const selectedHospital = hospitals.find((hospital) => hospital.id === form.values.hospital_id);

  const handleSubmit = form.onSubmit(async (values) => {
    const hospital = hospitals.find((entry) => entry.id === values.hospital_id);
    if (!hospital) return;

    try {
      const request = await createRequest({
        ...values,
        hospital_name: hospital.name,
        note: values.note.trim(),
      });
      notifications.show({
        title: 'درخواست ثبت شد',
        message: `${request.id} در وضعیت «در انتظار بررسی» قرار گرفت.`,
        color: 'green',
        icon: <CheckCircle size={18} weight="fill" />,
      });
      navigate(`/requests/${request.id}`);
    } catch (error) {
      notifications.show({
        title: 'ثبت درخواست انجام نشد',
        message: error instanceof Error ? error.message : 'خطای نامشخص در ثبت درخواست رخ داد.',
        color: 'red',
      });
    }
  });

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="درخواست بیمارستان"
        title="ثبت درخواست جدید"
        description="فیلدها دقیقاً مطابق قرارداد رسمی‌اند: بیمارستان، گروه خونی، فرآورده، تعداد واحد، فوریت و یادداشت اختیاری."
        actions={
          <Button component={Link} to="/requests" variant="default">
            بازگشت به فهرست
          </Button>
        }
      />

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <SectionCard
                title="اطلاعات درخواست"
                description="پس از ثبت، درخواست در وضعیت pending_review قرار می‌گیرد و باید توسط هماهنگ‌کننده تأیید شود."
              >
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Select
                    label="بیمارستان درخواست‌دهنده"
                    placeholder="یک بیمارستان انتخاب کنید"
                    data={hospitals.map((hospital) => ({
                      value: hospital.id,
                      label: hospital.city ? `${hospital.name} — ${hospital.city}` : hospital.name,
                    }))}
                    searchable
                    allowDeselect={false}
                    withAsterisk
                    {...form.getInputProps('hospital_id')}
                  />

                  <Select
                    label="گروه خونی گیرنده"
                    placeholder="گروه خونی"
                    data={BLOOD_GROUPS.map((group) => ({ value: group, label: group }))}
                    allowDeselect={false}
                    withAsterisk
                    {...form.getInputProps('blood_group')}
                  />

                  <Box className="sm:col-span-2">
                    <Text size="sm" fw={600} mb={6}>
                      فرآورده موردنیاز <span className="text-[var(--bn-crimson)]">*</span>
                    </Text>
                    <SegmentedControl
                      fullWidth
                      value={form.values.product}
                      onChange={(value) => form.setFieldValue('product', value as Product)}
                      data={PRODUCTS.map((product) => ({
                        value: product,
                        label: PRODUCT_LABELS[product],
                      }))}
                    />
                    <Text size="xs" c="dimmed" mt={6}>
                      فقط سه فرآورده رسمی مجاز است؛ فیلد product_type در قرارداد وجود ندارد.
                    </Text>
                  </Box>

                  <NumberInput
                    label="تعداد واحد"
                    description="حداقل ۱ و حداکثر ۲۰ واحد"
                    min={1}
                    max={20}
                    clampBehavior="strict"
                    withAsterisk
                    {...form.getInputProps('units')}
                  />

                  <Box>
                    <Text size="sm" fw={600} mb={6}>
                      سطح فوریت <span className="text-[var(--bn-crimson)]">*</span>
                    </Text>
                    <SegmentedControl
                      fullWidth
                      value={form.values.urgency}
                      onChange={(value) => form.setFieldValue('urgency', value as Urgency)}
                      data={URGENCIES.map((urgency) => ({
                        value: urgency,
                        label: URGENCY_LABELS[urgency],
                      }))}
                    />
                    <Text size="xs" c="dimmed" mt={6}>
                      هدف زمانی: {formatNumber(URGENCY_SLA_MINUTES[form.values.urgency])} دقیقه
                    </Text>
                  </Box>

                  <Box className="sm:col-span-2">
                    <Textarea
                      label="یادداشت اختیاری"
                      description="حداکثر ۵۰۰ نویسه؛ از درج اطلاعات هویتی حساس خودداری کنید."
                      placeholder="مثلاً بخش اورژانس — نیاز برای دو بیمار تصادف"
                      autosize
                      minRows={3}
                      maxRows={6}
                      maxLength={500}
                      {...form.getInputProps('note')}
                    />
                    <Text size="xs" c="dimmed" ta="end" mt={4}>
                      {formatNumber(form.values.note.length)} / ۵۰۰
                    </Text>
                  </Box>
                </SimpleGrid>
              </SectionCard>

              <SectionCard
                title="کلید Idempotency"
                description="برای جلوگیری از ثبت تکراری درخواست در تکرار ارسال یا قطع اتصال"
              >
                <Stack gap="sm">
                  <Group gap="sm" wrap="nowrap" align="flex-end">
                    <TextInput
                      label="Idempotency-Key"
                      value={idempotencyKey}
                      readOnly
                      className="flex-1"
                      dir="ltr"
                      styles={{ input: { fontFamily: 'ui-monospace, monospace', direction: 'ltr' } }}
                    />
                    <Button
                      variant="default"
                      onClick={() => setIdempotencyKey(createIdempotencyKey())}
                      leftSection={<ArrowsClockwise size={16} />}
                    >
                      کلید جدید
                    </Button>
                  </Group>
                  <Text size="xs" c="dimmed" lh={1.75}>
                    طول مجاز کلید ۱ تا ۱۲۸ نویسه است. در قرارداد واقعی، همان کلید با بدنه یکسان پاسخ تکراری
                    می‌دهد و همان کلید با بدنه متفاوت خطای ۴۲۲ ایجاد می‌کند.
                  </Text>
                </Stack>
              </SectionCard>

              <Group justify="space-between" gap="sm">
                <Button component={Link} to="/requests" variant="subtle" color="gray">
                  انصراف
                </Button>
                <Button
                  type="submit"
                  color="brand"
                  size="md"
                  leftSection={<PaperPlaneTilt size={18} weight="fill" />}
                >
                  ثبت درخواست
                </Button>
              </Group>
            </Stack>
          </form>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <SectionCard title="پیش‌نمایش موجودی سازگار" description="بر اساس ماتریس رسمی compat.yaml و FEFO">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start" gap="sm">
                  <Box>
                    <Text size="xs" c="dimmed">
                      موجودی سازگار قابل تخصیص
                    </Text>
                    <Text className="bn-number text-[1.7rem] font-extrabold leading-tight text-[var(--bn-ink)]">
                      {formatUnits(compatibleUnits)}
                    </Text>
                  </Box>
                  <ThemeIcon size={42} radius="md" variant="light" color="cyan" aria-hidden="true">
                    <Drop size={21} weight="fill" />
                  </ThemeIcon>
                </Group>

                {compatibleUnits > 0 ? (
                  <Box className="rounded-xl border border-[#D8EAE6] bg-[#F7FBFA] p-3">
                    <Text size="xs" fw={700} mb={4}>
                      نزدیک‌ترین انقضا برای FEFO
                    </Text>
                    {nearestItem && (
                      <Text size="xs" c="dimmed" lh={1.7}>
                        <span className="bn-ltr">{nearestItem.id}</span> · {nearestItem.center_name} ·{' '}
                        {formatNumber(nearestItem.units)} واحد ·{' '}
                        {expiryLabel(isoFromSimMinute(nearestItem.expires_sim_min), state.sim_time)}
                      </Text>
                    )}
                  </Box>
                ) : (
                  <InlineMessage tone="warning" title="موجودی سازگار کافی نیست">
                    برای این ترکیب فرآورده و گروه خونی، موجودی قابل تخصیص در داده نمایشی وجود ندارد. ثبت درخواست
                    همچنان ممکن است و اهداکننده‌ها می‌توانند دعوت شوند.
                  </InlineMessage>
                )}

                {selectedHospital && (
                  <Text size="xs" c="dimmed" lh={1.7}>
                    بیمارستان انتخاب‌شده: {selectedHospital.name}
                    {selectedHospital.city ? ` — ${selectedHospital.city}` : ''}
                  </Text>
                )}
              </Stack>
            </SectionCard>

            <SectionCard title="فیلدهای رسمی قرارداد">
              <Stack gap="xs">
                {[
                  ['hospital_id', 'شناسه بیمارستان'],
                  ['blood_group', 'گروه خونی گیرنده'],
                  ['product', 'red_cells / platelets / plasma'],
                  ['units', '۱ تا ۲۰'],
                  ['urgency', 'critical / urgent / planned'],
                  ['note', 'اختیاری، حداکثر ۵۰۰ نویسه'],
                ].map(([field, description]) => (
                  <Group key={field} justify="space-between" gap="xs" wrap="nowrap">
                    <Badge color="gray" variant="light" size="xs" className="bn-mono" dir="ltr">
                      {field}
                    </Badge>
                    <Text size="xs" c="dimmed" ta="end">
                      {description}
                    </Text>
                  </Group>
                ))}
              </Stack>
              <Divider my="sm" />
              <Group gap={6} align="flex-start" wrap="nowrap">
                <ShieldCheck size={17} color="#067647" aria-hidden="true" />
                <Text size="xs" c="dimmed" lh={1.7}>
                  احراز هویت در قرارداد با hospitalBearer انجام می‌شود. این فرم نمایشی هیچ توکن واقعی ذخیره
                  نمی‌کند.
                </Text>
              </Group>
            </SectionCard>

            <InlineMessage tone="info" title="پنج کمیت را جدا نگه دارید">
              مقدار درخواستی، موجودی سازگار، مقدار تخصیص‌یافته، مقدار تأمین‌شده و مقدار باقی‌مانده پنج مفهوم
              مستقل‌اند. تخصیص یا پذیرش دعوت به‌تنهایی اهدا محسوب نمی‌شود.
            </InlineMessage>

            <Group gap={6} align="flex-start" wrap="nowrap" c="dimmed">
              <Lightbulb size={17} aria-hidden="true" />
              <Text size="xs" lh={1.7}>
                این عملیات در حالت نمایشی روی localStorage همین مرورگر اجرا می‌شود و به Backend متصل نیست.
              </Text>
            </Group>

            <Group gap={6} align="center" c="dimmed">
              <FirstAidKit size={17} aria-hidden="true" />
              <Text size="xs">فقط رویداد donated موجودی واقعی را افزایش می‌دهد.</Text>
            </Group>

            <Group gap={6} align="center" c="dimmed">
              <Key size={17} aria-hidden="true" />
              <Text size="xs" className="bn-mono" dir="ltr">
                Idempotency-Key + X-Sim-Time
              </Text>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
