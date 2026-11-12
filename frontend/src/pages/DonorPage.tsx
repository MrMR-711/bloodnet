import { useState, type ReactNode } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  ArrowRight,
  Check,
  CheckCircle,
  Clock,
  Drop,
  Envelope,
  FirstAidKit,
  Info,
  MapPin,
  Phone,
  Prohibit,
  ShieldCheck,
  Truck,
  UsersThree,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import {
  BloodGroupBadge,
  DonorStatusBadge,
  GatewayStatusBadge,
  ProductBadge,
  StateBadge,
} from '../components/Badges';
import { EmptyState, InlineMessage } from '../components/StateViews';
import {
  DemoError,
  remainingUnits,
  useDemoStore,
} from '../data/DemoStoreContext';
import {
  formatDateTime,
  formatNumber,
  formatRelative,
  formatUnits,
} from '../lib/format';
import {
  DONOR_STATUS_LABELS,
  PRODUCT_LABELS,
} from '../lib/labels';
import type { DonorProgress, DonorRecord } from '../types/domain';

const DONOR_STEPS: { key: string; label: string; icon: ReactNode }[] = [
  { key: 'invited', label: 'دعوت', icon: <Envelope size={14} /> },
  { key: 'accepted', label: 'پذیرش', icon: <Check size={14} /> },
  { key: 'en_route', label: 'در مسیر', icon: <Truck size={14} /> },
  { key: 'arrived', label: 'رسیدن', icon: <MapPin size={14} /> },
  { key: 'screen_pass', label: 'غربالگری', icon: <ShieldCheck size={14} /> },
  { key: 'donated', label: 'اهدای واقعی', icon: <Drop size={14} weight="fill" /> },
];

const FAILED_STEP: Partial<Record<DonorRecord['status'], number>> = {
  declined: 1,
  screen_fail: 4,
  no_show: 5,
};

export function DonorPage() {
  const { state, respondDonor, progressDonor } = useDemoStore();
  const [searchParams] = useSearchParams();
  const requestDonorId = searchParams.get('donor');
  const [selectedDonorId, setSelectedDonorId] = useState(
    requestDonorId ?? state.donors[0]?.id ?? '',
  );

  const selectedDonor =
    state.donors.find((donor) => donor.id === selectedDonorId) ?? state.donors[0] ?? null;
  const request = selectedDonor
    ? state.requests.find((item) => item.id === selectedDonor.request_id)
    : null;

  const notifyError = (error: unknown) => {
    notifications.show({
      title: 'عملیات انجام نشد',
      message: error instanceof DemoError ? error.message : 'خطای نامشخص در حالت نمایشی رخ داد.',
      color: 'red',
    });
  };

  const handleResponse = (response: 'accepted' | 'declined') => {
    if (!selectedDonor) return;
    try {
      respondDonor(selectedDonor.id, response);
      notifications.show({
        title: response === 'accepted' ? 'دعوت پذیرفته شد' : 'دعوت رد شد',
        message:
          response === 'accepted'
            ? 'پذیرش دعوت فقط شمارنده confirmed را تغییر می‌دهد و اهدا محسوب نمی‌شود.'
            : 'رد دعوت هیچ تأثیری بر مقدار تأمین‌شده ندارد.',
        color: response === 'accepted' ? 'green' : 'gray',
        icon: response === 'accepted' ? <CheckCircle size={18} /> : <X size={18} />,
      });
    } catch (error) {
      notifyError(error);
    }
  };

  const handleProgress = (progress: DonorProgress) => {
    if (!selectedDonor) return;
    try {
      progressDonor(selectedDonor.id, progress);
      notifications.show({
        title: progress === 'donated' ? 'اهدای واقعی ثبت شد' : 'رویداد اهداکننده ثبت شد',
        message:
          progress === 'donated'
            ? 'فقط این رویداد مقدار «واقعاً تأمین‌شده» را یک واحد افزایش داد.'
            : 'این رویداد مقدار تأمین‌شده را تغییر نمی‌دهد.',
        color: progress === 'donated' ? 'green' : 'cyan',
        icon: progress === 'donated' ? <FirstAidKit size={18} /> : <Info size={18} />,
      });
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="مسیر اهداکننده"
        title="پورتال اهداکننده"
        description="دعوت، پذیرش، حرکت، رسیدن، غربالگری و اهدای واقعی رویدادهای مستقل‌اند. فقط ثبت donated موجودی واقعی می‌سازد."
        actions={
          <Button component={Link} to="/inventory" variant="default" leftSection={<Drop size={17} weight="fill" />}>
            موجودی مراکز
          </Button>
        }
      />

      {!selectedDonor ? (
        <EmptyState
          title="اهداکننده‌ای در نمونه وجود ندارد"
          description="داده نمایشی را از منوی کاربر بازنشانی کنید یا درخواست جدیدی ثبت کنید."
          icon={<UsersThree size={26} />}
          action={
            <Button component={Link} to="/requests/new" leftSection={<ArrowRight size={16} />}>
              ثبت درخواست جدید
            </Button>
          }
        />
      ) : (
        <Grid gap="lg">
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="lg">
              <SectionCard title="انتخاب اهداکننده" description={`${formatNumber(state.donors.length)} اهداکننده نمایشی`}>
                <Select
                  label="اهداکننده"
                  value={selectedDonor.id}
                  onChange={(value) => value && setSelectedDonorId(value)}
                  data={state.donors.map((donor) => ({
                    value: donor.id,
                    label: `${donor.name} — ${donor.blood_group} — ${DONOR_STATUS_LABELS[donor.status]}`,
                  }))}
                  allowDeselect={false}
                  searchable
                />

                <Stack gap="xs" mt="md" visibleFrom="md">
                  {state.donors.map((donor) => {
                    const isActive = donor.id === selectedDonor.id;
                    return (
                      <UnstyledButton
                        key={donor.id}
                        onClick={() => setSelectedDonorId(donor.id)}
                        aria-pressed={isActive}
                        className="w-full rounded-xl border p-3 text-start transition-colors"
                        style={{
                          borderColor: isActive ? '#fca5a5' : 'var(--bn-border)',
                          background: isActive ? '#fff1f1' : 'white',
                        }}
                      >
                        <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
                          <Box className="min-w-0">
                            <Group gap={6} wrap="nowrap">
                              <Text size="sm" fw={700} truncate>
                                {donor.name}
                              </Text>
                              <BloodGroupBadge group={donor.blood_group} size="xs" />
                            </Group>
                            <Text size="xs" c="dimmed" mt={3} truncate>
                              {donor.center_name}
                            </Text>
                          </Box>
                          <DonorStatusBadge status={donor.status} size="xs" />
                        </Group>
                      </UnstyledButton>
                    );
                  })}
                </Stack>
              </SectionCard>

              <InlineMessage tone="info" title="پذیرش دعوت ≠ اهدا">
                دعوت شدن، پذیرفتن، حرکت به مرکز، رسیدن یا قبولی غربالگری هیچ‌کدام باعث افزایش «مقدار واقعاً
                تأمین‌شده» نمی‌شوند. فقط رویداد <span className="bn-mono bn-ltr">donated</span> این کار را می‌کند.
              </InlineMessage>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="lg">
              <SectionCard
                title="کارت دعوت اهدا"
                description="اطلاعات هویتی نمایشی و وضعیت پیام Gateway"
                action={<DonorStatusBadge status={selectedDonor.status} size="md" />}
              >
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
                    <Box>
                      <Group gap="sm" wrap="nowrap">
                        <Text fw={800} fz="xl">
                          {selectedDonor.name}
                        </Text>
                        <BloodGroupBadge group={selectedDonor.blood_group} size="md" />
                      </Group>
                      <Group gap="md" mt={6} c="dimmed">
                        <Group gap={5}>
                          <Phone size={14} aria-hidden="true" />
                          <Text size="xs" className="bn-ltr">
                            {selectedDonor.phone_masked}
                          </Text>
                        </Group>
                        <Group gap={5}>
                          <MapPin size={14} aria-hidden="true" />
                          <Text size="xs">{selectedDonor.center_name}</Text>
                        </Group>
                      </Group>
                    </Box>
                    <Stack gap={6} align="flex-end">
                      <GatewayStatusBadge status={selectedDonor.gateway_status} size="sm" />
                      <Text size="xs" c="dimmed">
                        دعوت: {formatRelative(selectedDonor.invited_at, state.sim_time)}
                      </Text>
                    </Stack>
                  </Group>

                  <Divider />

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    <InfoLine label="شناسه اهداکننده" value={selectedDonor.id} mono />
                    <InfoLine label="فرآورده" value={PRODUCT_LABELS[selectedDonor.product]} />
                    <InfoLine label="درخواست مرتبط" value={selectedDonor.request_id} mono />
                    <InfoLine label="آخرین به‌روزرسانی" value={formatDateTime(selectedDonor.updated_at)} />
                  </SimpleGrid>

                  {request && (
                    <Box className="rounded-xl border border-[var(--bn-border)] bg-[#fff8f8] p-3">
                      <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
                        <Box>
                          <Group gap={6} wrap="nowrap">
                            <Text size="xs" c="dimmed">
                              درخواست مرتبط
                            </Text>
                            <StateBadge state={request.state} size="xs" />
                          </Group>
                          <Text size="sm" fw={700} mt={3}>
                            {request.hospital_name}
                          </Text>
                          <Group gap={6} mt={4}>
                            <ProductBadge product={request.product} size="xs" />
                            <Text size="xs" c="dimmed">
                              {formatNumber(request.supplied_units)} از {formatNumber(request.units)} واحد تأمین‌شده
                            </Text>
                          </Group>
                        </Box>
                        <Button
                          component={Link}
                          to={`/requests/${request.id}`}
                          variant="subtle"
                          size="xs"
                          rightSection={<ArrowRight size={13} />}
                        >
                          جزئیات درخواست
                        </Button>
                      </Group>
                    </Box>
                  )}
                </Stack>
              </SectionCard>

              <SectionCard title="مسیر اهدا" description="هر مرحله یک رویداد مستقل است؛ رنگ سبز فقط وضعیت مسیر را نشان می‌دهد">
                <Box className="rounded-xl border border-[var(--bn-border)] bg-white p-4">
                  <Group gap={0} align="flex-start" wrap="nowrap" className="bn-scroll-x">
                    {DONOR_STEPS.map((step, index) => {
                      const stepState = donorStepState(selectedDonor, index);
                      return (
                        <Box key={step.key} className="bn-donor-step min-w-[76px]" data-state={stepState}>
                          <span className="bn-donor-dot">{step.icon}</span>
                          <Text size="xs" fw={stepState === 'current' ? 700 : 500} c={stepState === 'pending' ? 'dimmed' : undefined}>
                            {step.label}
                          </Text>
                        </Box>
                      );
                    })}
                  </Group>
                </Box>

                <Group justify="space-between" mt="md" gap="sm" wrap="wrap">
                  <Group gap={6}>
                    <Clock size={15} color="#6b4a4f" aria-hidden="true" />
                    <Text size="xs" c="dimmed">
                      آخرین رویداد: {formatRelative(selectedDonor.updated_at, state.sim_time)}
                    </Text>
                  </Group>
                  {selectedDonor.status === 'donated' ? (
                    <Badge color="green" variant="light" leftSection={<CheckCircle size={13} />}>
                      اهدای واقعی ثبت شد
                    </Badge>
                  ) : (
                    <Badge color="orange" variant="light">
                      هنوز اهدای واقعی ثبت نشده
                    </Badge>
                  )}
                </Group>
              </SectionCard>

              <SectionCard
                title="اقدام بعدی"
                description="فقط گذارهای مجاز در قرارداد نمایش داده می‌شوند"
                action={<DonorStatusBadge status={selectedDonor.status} size="md" />}
              >
                <Stack gap="sm">
                  {selectedDonor.status === 'invited' && (
                    <>
                      <Text size="sm" c="dimmed" lh={1.8}>
                        این اهداکننده دعوت شده و منتظر پاسخ است. پذیرش دعوت شمارنده confirmed را افزایش می‌دهد،
                        اما هیچ واحدی به موجودی یا تأمین‌شده اضافه نمی‌کند.
                      </Text>
                      <Group gap="sm">
                        <Button
                          color="green"
                          leftSection={<Check size={17} />}
                          onClick={() => handleResponse('accepted')}
                        >
                          پذیرش دعوت
                        </Button>
                        <Button
                          variant="default"
                          color="gray"
                          leftSection={<X size={17} />}
                          onClick={() => handleResponse('declined')}
                        >
                          رد دعوت
                        </Button>
                      </Group>
                    </>
                  )}

                  {selectedDonor.status === 'accepted' && (
                    <ProgressButton
                      label="حرکت به مرکز"
                      description="en_route — اهداکننده در مسیر است؛ تأمین‌شده تغییر نمی‌کند."
                      icon={<Truck size={18} />}
                      color="cyan"
                      onClick={() => handleProgress('en_route')}
                    />
                  )}

                  {selectedDonor.status === 'en_route' && (
                    <ProgressButton
                      label="رسیدن به مرکز"
                      description="arrived — رسیدن به مرکز هنوز اهدا نیست."
                      icon={<MapPin size={18} />}
                      color="indigo"
                      onClick={() => handleProgress('arrived')}
                    />
                  )}

                  {selectedDonor.status === 'arrived' && (
                    <Group gap="sm" grow>
                      <ProgressButton
                        label="قبولی غربالگری"
                        description="screen_pass — صلاحیت اولیه؛ تأمین‌شده بدون تغییر."
                        icon={<ShieldCheck size={18} />}
                        color="teal"
                        onClick={() => handleProgress('screen_pass')}
                      />
                      <ProgressButton
                        label="رد غربالگری"
                        description="screen_fail — اهدا انجام نمی‌شود."
                        icon={<Prohibit size={18} />}
                        color="red"
                        onClick={() => handleProgress('screen_fail')}
                      />
                    </Group>
                  )}

                  {selectedDonor.status === 'screen_pass' && (
                    <Stack gap="sm">
                      <InlineMessage tone="warning" title="تنها اقدام مؤثر بر تأمین">
                        ثبت «اهدای واقعی» تنها عملیاتی است که یک واحد به مقدار تأمین‌شده اضافه می‌کند. پیش از
                        ثبت، از انجام اهدا و ثبت معتبر رویداد مطمئن شوید.
                      </InlineMessage>
                      <Group gap="sm" grow>
                        <ProgressButton
                          label="ثبت اهدای واقعی"
                          description="donated — supplied +۱ و fulfilled +۱."
                          icon={<FirstAidKit size={18} />}
                          color="green"
                          onClick={() => handleProgress('donated')}
                        />
                        <ProgressButton
                          label="عدم مراجعه"
                          description="no_show — تأمین‌شده بدون تغییر."
                          icon={<X size={18} />}
                          color="gray"
                          onClick={() => handleProgress('no_show')}
                        />
                      </Group>
                    </Stack>
                  )}

                  {['declined', 'screen_fail', 'no_show', 'donated'].includes(selectedDonor.status) && (
                    <InlineMessage tone={selectedDonor.status === 'donated' ? 'success' : 'info'} title="مسیر این اهداکننده بسته شده است">
                      وضعیت نهایی: {DONOR_STATUS_LABELS[selectedDonor.status]}. در این وضعیت گذار دیگری در نمایش
                      مجاز نیست.
                    </InlineMessage>
                  )}
                </Stack>
              </SectionCard>

              {request && (
                <SectionCard title="خلاصه تأمین درخواست مرتبط" description="پنج کمیت را با هم اشتباه نگیرید">
                  <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
                    <MiniStat label="درخواستی" value={formatUnits(request.units)} />
                    <MiniStat label="تخصیص‌یافته" value={formatUnits(request.allocated_units)} />
                    <MiniStat label="واقعاً تأمین‌شده" value={formatUnits(request.supplied_units)} tone="green" />
                    <MiniStat label="باقی‌مانده" value={formatUnits(remainingUnits(request))} tone="orange" />
                  </SimpleGrid>
                  <Text size="xs" c="dimmed" mt="sm" lh={1.75}>
                    تأمین‌شده فقط از رویدادهای <span className="bn-mono bn-ltr">donated</span> می‌آید. تخصیص
                    موجودی و پذیرش دعوت در این عدد اثری ندارند.
                  </Text>
                </SectionCard>
              )}

              <Group gap={6} align="flex-start" c="dimmed">
                <WarningCircle size={17} aria-hidden="true" />
                <Text size="xs" lh={1.7}>
                  این پورتال نمایشی است و پیام Gateway واقعی ارسال نمی‌کند. داده‌ها ساختگی‌اند و مبنای تصمیم
                  پزشکی نیستند.
                </Text>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}

function donorStepState(
  donor: DonorRecord,
  index: number,
): 'done' | 'current' | 'pending' | 'failed' {
  const failedAt = FAILED_STEP[donor.status];
  if (failedAt !== undefined) {
    if (index < failedAt) return 'done';
    if (index === failedAt) return 'failed';
    return 'pending';
  }
  const order = ['invited', 'accepted', 'en_route', 'arrived', 'screen_pass', 'donated'];
  const currentIndex = order.indexOf(donor.status);
  if (donor.status === 'donated') return index <= currentIndex ? 'done' : 'pending';
  if (index < currentIndex) return 'done';
  if (index === currentIndex) return 'current';
  return 'pending';
}

function InfoLine({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <Group justify="space-between" gap="sm" wrap="nowrap">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" fw={600} className={mono ? 'bn-mono' : undefined} dir={mono ? 'ltr' : undefined} ta="end">
        {value}
      </Text>
    </Group>
  );
}

function ProgressButton({
  label,
  description,
  icon,
  color,
  onClick,
}: {
  label: string;
  description: string;
  icon: ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <Box className="flex-1 rounded-xl border border-[var(--bn-border)] p-3">
      <Button color={color} fullWidth leftSection={icon} onClick={onClick}>
        {label}
      </Button>
      <Text size="xs" c="dimmed" mt={6} lh={1.65}>
        {description}
      </Text>
    </Box>
  );
}

function MiniStat({ label, value, tone = 'brand' }: { label: string; value: string; tone?: string }) {
  return (
    <Box className="rounded-lg border border-[var(--bn-border)] bg-[#fff8f8] p-3">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={800} c={`${tone}.7`} className="bn-number" mt={2}>
        {value}
      </Text>
    </Box>
  );
}
