import { useState, type ReactNode } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  ArrowRight,
  CheckCircle,
  ClipboardText,
  Clock,
  Copy,
  Drop,
  FirstAidKit,
  Heartbeat,
  MapPin,
  PencilSimple,
  Prohibit,
  Siren,
  Truck,
  UsersThree,
} from '@phosphor-icons/react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import {
  BloodGroupBadge,
  DonorStatusBadge,
  GatewayStatusBadge,
  ProductBadge,
  StateBadge,
  UrgencyBadge,
} from '../components/Badges';
import { EmptyState, ErrorState, InlineMessage } from '../components/StateViews';
import {
  compatibleUnitsFor,
  DemoError,
  remainingUnits,
  useDemoStore,
} from '../data/DemoStoreContext';
import {
  clampPercent,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  formatRelative,
  minutesBetween,
} from '../lib/format';
import {
  STATE_DESCRIPTIONS,
  URGENCY_LABELS,
  URGENCY_SLA_MINUTES,
  PRODUCT_LABELS,
  auditTypeLabel,
} from '../lib/labels';
import type { Urgency } from '../types/domain';
import { URGENCIES } from '../types/domain';

export function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const {
    state,
    approveRequest,
    cancelRequest,
    amendRequest,
  } = useDemoStore();
  const request = state.requests.find((item) => item.id === requestId);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [amendOpen, setAmendOpen] = useState(false);
  const [amendUrgency, setAmendUrgency] = useState<Urgency>('urgent');

  if (!request) {
    return (
      <Stack gap="lg">
        <PageHeader
          eyebrow="جزئیات درخواست"
          title="درخواست پیدا نشد"
          description={requestId ? `شناسه ${requestId} در داده نمایشی وجود ندارد.` : 'شناسه درخواست نامعتبر است.'}
          actions={
            <Button component={Link} to="/requests" variant="default" leftSection={<ArrowRight size={16} />}>
              بازگشت به فهرست
            </Button>
          }
        />
        <ErrorState
          code="۴۰۴"
          title="درخواست موردنظر موجود نیست"
          description="ممکن است شناسه اشتباه باشد یا داده نمایشی بازنشانی شده باشد."
          action={
            <Button component={Link} to="/requests" leftSection={<ArrowRight size={16} />}>
              مشاهده همه درخواست‌ها
            </Button>
          }
        />
      </Stack>
    );
  }

  const terminal = ['fulfilled', 'cancelled', 'expired'].includes(request.state);
  const compatibleUnits = compatibleUnitsFor(state, request);
  const remaining = remainingUnits(request);
  const dispatches = state.dispatches
    .filter((dispatch) => dispatch.request_id === request.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const donors = state.donors.filter((donor) => donor.request_id === request.id);
  const events = state.audit.filter((event) => event.request_id === request.id).slice(0, 10);
  const elapsedMinutes = Math.max(0, minutesBetween(request.created_at, state.sim_time));
  const slaMinutes = URGENCY_SLA_MINUTES[request.urgency];
  const slaRemaining = Math.max(0, slaMinutes - elapsedMinutes);

  const notifyError = (error: unknown) => {
    notifications.show({
      title: 'عملیات انجام نشد',
      message: error instanceof DemoError ? error.message : 'خطای نامشخص در حالت نمایشی رخ داد.',
      color: 'red',
    });
  };

  const handleApprove = () => {
    try {
      approveRequest(request.id);
      notifications.show({
        title: 'درخواست تأیید شد',
        message: 'وضعیت رسمی درخواست به open تغییر کرد.',
        color: 'green',
        icon: <CheckCircle size={18} weight="fill" />,
      });
    } catch (error) {
      notifyError(error);
    }
  };

  const handleCancel = () => {
    try {
      cancelRequest(request.id);
      setCancelOpen(false);
      notifications.show({
        title: 'درخواست لغو شد',
        message: 'در وضعیت نمایشی، تأمین‌شده و تخصیص‌ها تغییر نکردند.',
        color: 'orange',
      });
    } catch (error) {
      notifyError(error);
    }
  };

  const handleAmend = () => {
    try {
      amendRequest(request.id, amendUrgency);
      setAmendOpen(false);
      notifications.show({
        title: 'سطح فوریت اصلاح شد',
        message: `فوریت جدید: ${URGENCY_LABELS[amendUrgency]}`,
        color: 'green',
      });
    } catch (error) {
      notifyError(error);
    }
  };

  const copyIdempotencyKey = async () => {
    try {
      await navigator.clipboard.writeText(request.idempotency_key);
      notifications.show({
        title: 'کلید کپی شد',
        message: 'Idempotency-Key در کلیپ‌بورد قرار گرفت.',
        color: 'green',
        icon: <Copy size={16} />,
      });
    } catch {
      notifications.show({
        title: 'کپی انجام نشد',
        message: 'مرورگر اجازه دسترسی به کلیپ‌بورد را نداد.',
        color: 'orange',
      });
    }
  };

  const counterRows = [
    { label: 'needed — مقدار درخواستی', value: request.counters.needed, color: 'brand' },
    { label: 'confirmed — پذیرش دعوت', value: request.counters.confirmed, color: 'cyan' },
    { label: 'en_route — در مسیر', value: request.counters.en_route, color: 'indigo' },
    { label: 'arrived — رسیده', value: request.counters.arrived, color: 'orange' },
    { label: 'fulfilled — اهدای واقعی', value: request.counters.fulfilled, color: 'green' },
  ];

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="جزئیات درخواست"
        title={<span className="bn-mono bn-ltr">{request.id}</span>}
        description={
          <span>
            {request.hospital_name} · {PRODUCT_LABELS[request.product]} · گروه{' '}
            <span className="bn-ltr">{request.blood_group}</span>
          </span>
        }
        actions={
          <>
            <Button component={Link} to="/requests" variant="default" leftSection={<ArrowRight size={16} />}>
              فهرست
            </Button>
            {request.state === 'pending_review' && (
              <Button color="green" onClick={handleApprove} leftSection={<CheckCircle size={16} />}>
                تأیید درخواست
              </Button>
            )}
            {!terminal && (
              <>
                <Button
                  component={Link}
                  to={`/inventory?request=${request.id}`}
                  leftSection={<Truck size={16} />}
                >
                  تخصیص موجودی
                </Button>
                <Button
                  variant="default"
                  leftSection={<PencilSimple size={16} />}
                  onClick={() => {
                    setAmendUrgency(request.urgency);
                    setAmendOpen(true);
                  }}
                >
                  اصلاح فوریت
                </Button>
                <Button
                  variant="subtle"
                  color="crimson"
                  leftSection={<Prohibit size={16} />}
                  onClick={() => setCancelOpen(true)}
                >
                  لغو
                </Button>
              </>
            )}
          </>
        }
      />

      <Group gap="sm" wrap="wrap">
        <StateBadge state={request.state} size="md" />
        <UrgencyBadge urgency={request.urgency} size="md" />
        <ProductBadge product={request.product} size="md" />
        <BloodGroupBadge group={request.blood_group} size="md" />
        <Badge color="gray" variant="light" size="md">
          {request.hospital_name}
        </Badge>
      </Group>

      <InlineMessage tone={request.supplied_units > 0 ? 'warning' : 'info'} title="تأمین واقعی با تخصیص یا پذیرش دعوت برابر نیست">
        «مقدار واقعاً تأمین‌شده» فقط با رویداد <span className="bn-mono bn-ltr">donated</span> افزایش می‌یابد.
        پذیرش دعوت، حرکت به مرکز، رسیدن، قبولی غربالگری یا تخصیص موجودی هیچ‌کدام اهدا محسوب نمی‌شوند.
      </InlineMessage>

      <SimpleGrid cols={{ base: 1, xs: 2, md: 5 }} spacing="md">
        <StatCard
          label="مقدار درخواستی"
          value={formatNumber(request.units)}
          hint="فیلد units در قرارداد"
          icon={<ClipboardText size={21} weight="duotone" />}
          color="brand"
        />
        <StatCard
          label="موجودی سازگار قابل تخصیص"
          value={formatNumber(compatibleUnits)}
          hint="موجودی فعلی با ماتریس رسمی"
          icon={<Drop size={21} weight="duotone" />}
          color="cyan"
        />
        <StatCard
          label="مقدار تخصیص‌یافته"
          value={formatNumber(request.allocated_units)}
          hint="تخصیص موجودی؛ هنوز اهدا نیست"
          icon={<Truck size={21} weight="duotone" />}
          color="indigo"
        />
        <StatCard
          label="مقدار واقعاً تأمین‌شده"
          value={formatNumber(request.supplied_units)}
          hint="فقط رویداد donated"
          icon={<FirstAidKit size={21} weight="duotone" />}
          color="green"
        />
        <StatCard
          label="مقدار باقی‌مانده"
          value={formatNumber(remaining)}
          hint="درخواستی منهای تأمین‌شده"
          icon={<Heartbeat size={21} weight="duotone" />}
          color={remaining > 0 ? 'crimson' : 'green'}
        />
      </SimpleGrid>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard title="وضعیت رسمی و شمارنده‌ها" description={STATE_DESCRIPTIONS[request.state]}>
              <Stack gap="md">
                <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
                  <Group gap="sm">
                    <StateBadge state={request.state} size="lg" />
                    <Badge color={slaRemaining > 0 ? 'orange' : 'red'} variant="light" size="lg">
                      {slaRemaining > 0
                        ? `${formatDuration(slaRemaining)} تا هدف ${URGENCY_LABELS[request.urgency]}`
                        : 'مهلت هدف گذشته است'}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    آخرین به‌روزرسانی: {formatRelative(request.updated_at, state.sim_time)}
                  </Text>
                </Group>

                <Box>
                  <Group justify="space-between" mb={6}>
                    <Text size="xs" c="dimmed">
                      پیشرفت تأمین واقعی
                    </Text>
                    <Text size="xs" fw={700} className="bn-number">
                      {formatNumber(request.supplied_units)} / {formatNumber(request.units)} —{' '}
                      {formatPercent(request.supplied_units, request.units)}
                    </Text>
                  </Group>
                  <Progress
                    value={clampPercent(request.supplied_units, request.units)}
                    size={10}
                    radius="xl"
                    color={request.supplied_units >= request.units ? 'green' : 'brand'}
                    aria-label="پیشرفت تأمین واقعی"
                  />
                </Box>

                <Divider />

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  {counterRows.map((counter) => (
                    <Group key={counter.label} justify="space-between" gap="sm" wrap="nowrap">
                      <Text size="xs" c="dimmed">
                        {counter.label}
                      </Text>
                      <Badge color={counter.color} variant="light" size="sm" className="bn-number">
                        {formatNumber(counter.value)}
                      </Badge>
                    </Group>
                  ))}
                </SimpleGrid>

                <Text size="xs" c="dimmed" lh={1.8}>
                  شمارنده‌های <span className="bn-mono bn-ltr">RequestState</span> مستقل‌اند؛ هیچ‌کدام به‌تنهایی
                  به‌معنای موجودی تأمین‌شده نیست.
                </Text>
              </Stack>
            </SectionCard>

            <SectionCard title="اطلاعات ثبت‌شده" description="مقادیر مطابق قرارداد رسمی">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <InfoRow label="بیمارستان" value={request.hospital_name} />
                <InfoRow
                  label="شناسه بیمارستان"
                  value={<span className="bn-mono bn-ltr">{request.hospital_id}</span>}
                />
                <InfoRow label="فرآورده" value={PRODUCT_LABELS[request.product]} />
                <InfoRow
                  label="گروه خونی گیرنده"
                  value={<span className="bn-ltr">{request.blood_group}</span>}
                />
                <InfoRow label="تعداد واحد" value={formatNumber(request.units)} />
                <InfoRow label="سطح فوریت" value={URGENCY_LABELS[request.urgency]} />
                <InfoRow label="زمان ثبت" value={formatDateTime(request.created_at)} />
                <InfoRow label="آخرین به‌روزرسانی" value={formatDateTime(request.updated_at)} />
                <InfoRow
                  label="یادداشت"
                  value={request.note || 'بدون یادداشت'}
                  fullWidth
                />
                <InfoRow
                  label="Idempotency-Key"
                  value={
                    <Group gap="xs" wrap="nowrap">
                      <Text size="xs" className="bn-mono" dir="ltr" style={{ wordBreak: 'break-all' }}>
                        {request.idempotency_key}
                      </Text>
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={copyIdempotencyKey}
                        leftSection={<Copy size={13} />}
                      >
                        کپی
                      </Button>
                    </Group>
                  }
                  fullWidth
                />
              </SimpleGrid>
            </SectionCard>

            <SectionCard
              title="تخصیص‌های موجودی"
              description={`${formatNumber(dispatches.length)} تخصیص ثبت‌شده — FEFO و ETA شبیه‌سازی`}
              action={
                !terminal && (
                  <Button
                    component={Link}
                    to={`/inventory?request=${request.id}`}
                    variant="light"
                    size="xs"
                    leftSection={<Truck size={14} />}
                  >
                    تخصیص جدید
                  </Button>
                )
              }
              noBodyPadding
            >
              {dispatches.length > 0 ? (
                <Table.ScrollContainer minWidth={700}>
                  <Table verticalSpacing="sm" horizontalSpacing="md">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>شناسه</Table.Th>
                        <Table.Th>مرکز</Table.Th>
                        <Table.Th>گروه اهداکننده</Table.Th>
                        <Table.Th>واحد</Table.Th>
                        <Table.Th>ETA</Table.Th>
                        <Table.Th>وضعیت</Table.Th>
                        <Table.Th>زمان</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {dispatches.map((dispatch) => (
                        <Table.Tr key={dispatch.id}>
                          <Table.Td>
                            <Text size="xs" className="bn-mono" dir="ltr">
                              {dispatch.id}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs">{dispatch.center_name}</Text>
                          </Table.Td>
                          <Table.Td>
                            <span className="bn-ltr">{dispatch.blood_group}</span>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" fw={700} className="bn-number">
                              {formatNumber(dispatch.units)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs">{formatDuration(dispatch.eta_sim_min)}</Text>
                          </Table.Td>
                          <Table.Td>
                            <GatewayStatusBadge status={dispatch.status} />
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed">
                              {formatRelative(dispatch.created_at, state.sim_time)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              ) : (
                <EmptyState
                  title="هنوز موجودی تخصیص نیافته"
                  description="از صفحه موجودی مراکز، ردیف سازگار با نزدیک‌ترین انقضا را انتخاب کنید."
                  icon={<Truck size={24} />}
                  action={
                    !terminal && (
                      <Button component={Link} to={`/inventory?request=${request.id}`} leftSection={<Drop size={16} />}>
                        رفتن به موجودی
                      </Button>
                    )
                  }
                />
              )}
            </SectionCard>

            <SectionCard
              title="دعوت‌های اهداکننده"
              description={`${formatNumber(donors.length)} اهداکننده مرتبط با این درخواست`}
              action={
                <Button component={Link} to="/donor" variant="subtle" size="xs" leftSection={<UsersThree size={14} />}>
                  پورتال اهداکننده
                </Button>
              }
            >
              {donors.length > 0 ? (
                <Stack gap="sm">
                  {donors.map((donor) => (
                    <Box key={donor.id} p="sm" className="rounded-xl border border-[var(--bn-border)]">
                      <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
                        <Box>
                          <Group gap={6} wrap="nowrap">
                            <Text size="sm" fw={700}>
                              {donor.name}
                            </Text>
                            <BloodGroupBadge group={donor.blood_group} size="xs" />
                          </Group>
                          <Text size="xs" c="dimmed" mt={3}>
                            {donor.center_name} · {formatNumber(1)} واحد · {donor.phone_masked}
                          </Text>
                        </Box>
                        <Group gap={6}>
                          <DonorStatusBadge status={donor.status} />
                          <GatewayStatusBadge status={donor.gateway_status} />
                        </Group>
                      </Group>
                      <Group justify="space-between" mt={8}>
                        <Text size="xs" c="dimmed">
                          آخرین به‌روزرسانی: {formatRelative(donor.updated_at, state.sim_time)}
                        </Text>
                        <Button component={Link} to={`/donor?donor=${donor.id}`} variant="subtle" size="compact-xs">
                          مشاهده در پورتال
                        </Button>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed" lh={1.8}>
                  هنوز اهداکننده‌ای برای این درخواست دعوت نشده است. دعوت اهداکننده موجودی واقعی ایجاد نمی‌کند.
                </Text>
              )}
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <SectionCard title="اقدام‌های مجاز" description="بر اساس وضعیت رسمی و نقش نمایشی">
              <Stack gap="xs">
                {request.state === 'pending_review' ? (
                  <Button color="green" fullWidth leftSection={<CheckCircle size={17} />} onClick={handleApprove}>
                    تأیید درخواست
                  </Button>
                ) : (
                  <Text size="xs" c="dimmed" lh={1.8}>
                    تأیید فقط برای درخواست <span className="bn-mono bn-ltr">pending_review</span> و با توکن
                    هماهنگ‌کننده مجاز است.
                  </Text>
                )}

                {!terminal ? (
                  <>
                    <Button
                      component={Link}
                      to={`/inventory?request=${request.id}`}
                      variant="light"
                      fullWidth
                      leftSection={<Truck size={17} />}
                    >
                      تخصیص موجودی
                    </Button>
                    <Button
                      variant="default"
                      fullWidth
                      leftSection={<PencilSimple size={17} />}
                      onClick={() => {
                        setAmendUrgency(request.urgency);
                        setAmendOpen(true);
                      }}
                    >
                      اصلاح فوریت
                    </Button>
                    <Button
                      variant="subtle"
                      color="crimson"
                      fullWidth
                      leftSection={<Prohibit size={17} />}
                      onClick={() => setCancelOpen(true)}
                    >
                      لغو درخواست
                    </Button>
                  </>
                ) : (
                  <InlineMessage tone="info" title="درخواست در وضعیت نهایی است">
                    در وضعیت <span className="bn-mono bn-ltr">{request.state}</span> امکان لغو، اصلاح یا تخصیص
                    جدید وجود ندارد.
                  </InlineMessage>
                )}
              </Stack>
            </SectionCard>

            <SectionCard title="خلاصه عملیات">
              <Stack gap="sm">
                <SummaryRow icon={<MapPin size={16} />} label="بیمارستان" value={request.hospital_name} />
                <SummaryRow
                  icon={<Siren size={16} />}
                  label="فوریت"
                  value={`${URGENCY_LABELS[request.urgency]} — هدف ${formatDuration(slaMinutes)}`}
                />
                <SummaryRow
                  icon={<Clock size={16} />}
                  label="زمان سپری‌شده"
                  value={formatDuration(elapsedMinutes)}
                />
                <SummaryRow
                  icon={<Drop size={16} />}
                  label="موجودی سازگار"
                  value={`${formatNumber(compatibleUnits)} واحد`}
                />
                <SummaryRow
                  icon={<FirstAidKit size={16} />}
                  label="تأمین واقعی"
                  value={`${formatNumber(request.supplied_units)} از ${formatNumber(request.units)} واحد`}
                />
              </Stack>
            </SectionCard>

            <SectionCard title="تایم‌لاین رویدادها" description="آخرین ۱۰ رویداد مرتبط با درخواست">
              {events.length > 0 ? (
                <Box className="bn-timeline-line">
                  <Stack gap="md">
                    {events.map((event) => (
                      <Group key={event.id} align="flex-start" gap="sm" wrap="nowrap">
                        <Box
                          className="mt-1 h-2.5 w-2.5 flex-none rounded-full"
                          style={{ background: event.actor_role === 'donor' ? '#0E7490' : '#0F766E' }}
                          aria-hidden="true"
                        />
                        <Box className="min-w-0">
                          <Text size="xs" fw={700} lh={1.6}>
                            {auditTypeLabel(event.type)}
                          </Text>
                          <Text size="xs" c="dimmed" lh={1.65}>
                            {event.summary}
                          </Text>
                          <Text size="xs" c="dimmed" lh={1.5} mt={2}>
                            {formatDateTime(event.at)} · {event.actor}
                          </Text>
                        </Box>
                      </Group>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Text size="sm" c="dimmed" lh={1.8}>
                  رویدادی برای این درخواست ثبت نشده است.
                </Text>
              )}
            </SectionCard>

            <InlineMessage tone="warning" title="یادآوری دامنه">
              این داده ساختگی است و راهنمای بالینی نیست. برای تصمیم واقعی، به سامانه رسمی و ماتریس سازگاری
              معتبر مراجعه کنید.
            </InlineMessage>
          </Stack>
        </Grid.Col>
      </Grid>

      <Modal opened={cancelOpen} onClose={() => setCancelOpen(false)} title="لغو درخواست" centered>
        <Stack gap="md">
          <Text size="sm" lh={1.8}>
            آیا از لغو درخواست <span className="bn-mono bn-ltr">{request.id}</span> مطمئن هستید؟ در قرارداد واقعی
            لغو تکراری پاسخ بدون تغییر می‌دهد؛ در این نمایش، وضعیت به cancelled تغییر می‌کند.
          </Text>
          <InlineMessage tone="warning" title="لغو به‌معنای بازگشت موجودی نیست">
            این عملیات نمایشی موجودی تخصیص‌یافته را برنمی‌گرداند و فقط وضعیت درخواست را تغییر می‌دهد.
          </InlineMessage>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setCancelOpen(false)}>
              انصراف
            </Button>
            <Button color="crimson" onClick={handleCancel} leftSection={<Prohibit size={16} />}>
              لغو کن
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={amendOpen} onClose={() => setAmendOpen(false)} title="اصلاح سطح فوریت" centered>
        <Stack gap="md">
          <Text size="sm" lh={1.8}>
            در قرارداد رسمی، بدنه اصلاح فقط فیلد <span className="bn-mono bn-ltr">urgency</span> را می‌پذیرد.
          </Text>
          <Box>
            <Text size="sm" fw={600} mb={6}>
              سطح فوریت جدید
            </Text>
            <SegmentedControl
              fullWidth
              value={amendUrgency}
              onChange={(value) => setAmendUrgency(value as Urgency)}
              data={URGENCIES.map((urgency) => ({
                value: urgency,
                label: URGENCY_LABELS[urgency],
              }))}
            />
            <Text size="xs" c="dimmed" mt={6}>
              هدف زمانی: {formatDuration(URGENCY_SLA_MINUTES[amendUrgency])}
            </Text>
          </Box>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setAmendOpen(false)}>
              انصراف
            </Button>
            <Button color="brand" onClick={handleAmend}>
              ثبت اصلاح
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function InfoRow({ label, value, fullWidth = false }: { label: string; value: ReactNode; fullWidth?: boolean }) {
  return (
    <Box className={fullWidth ? 'sm:col-span-2' : undefined}>
      <Text size="xs" c="dimmed" mb={3}>
        {label}
      </Text>
      <Text size="sm" fw={600} lh={1.7}>
        {value}
      </Text>
    </Box>
  );
}

function SummaryRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Group justify="space-between" gap="sm" wrap="nowrap">
      <Group gap={6} wrap="nowrap" c="dimmed">
        {icon}
        <Text size="xs" c="dimmed">
          {label}
        </Text>
      </Group>
      <Text size="xs" fw={600} ta="end">
        {value}
      </Text>
    </Group>
  );
}
