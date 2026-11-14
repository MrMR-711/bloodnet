import { Badge, Box, Button, Grid, Group, Progress, SimpleGrid, Stack, Text } from '@mantine/core';
import {
  ArrowLeft,
  Buildings,
  ChartBar,
  ClipboardText,
  Clock,
  Drop,
  FirstAidKit,
  Heartbeat,
  Plus,
  Siren,
  UsersThree,
  WarningCircle,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { RequestTable } from '../components/RequestTable';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import { StateBadge } from '../components/Badges';
import { EmptyState, InlineMessage } from '../components/StateViews';
import { activeRequestCount, useDemoStore } from '../data/DemoStoreContext';
import {
  clampPercent,
  expiryLabel,
  expiryTone,
  formatDateTime,
  formatNumber,
  formatRelative,
  isoFromSimMinute,
} from '../lib/format';
import { PRODUCT_LABELS, URGENCY_SLA_MINUTES } from '../lib/labels';
import { PRODUCTS, REQUEST_STATES } from '../types/domain';

const TERMINAL_STATES = ['fulfilled', 'cancelled', 'expired'] as const;

const PRODUCT_HEX: Record<(typeof PRODUCTS)[number], string> = {
  red_cells: '#C2413A',
  platelets: '#B45309',
  plasma: '#be123c',
};

export function DashboardPage() {
  const { state, centers } = useDemoStore();

  const activeRequests = state.requests.filter(
    (request) => !TERMINAL_STATES.includes(request.state as (typeof TERMINAL_STATES)[number]),
  );
  const neededUnits = activeRequests.reduce((sum, request) => sum + request.units, 0);
  const allocatedUnits = activeRequests.reduce((sum, request) => sum + request.allocated_units, 0);
  const suppliedUnits = activeRequests.reduce((sum, request) => sum + request.supplied_units, 0);
  const invitedDonors = state.donors.filter((donor) => donor.status === 'invited').length;

  const criticalRequests = activeRequests
    .filter((request) => request.urgency === 'critical')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const availableUnits = state.inventory.reduce((sum, item) => sum + item.units, 0);
  const expiringItems = state.inventory
    .filter((item) =>
      ['critical', 'expired'].includes(expiryTone(isoFromSimMinute(item.expires_sim_min), state.sim_time)),
    )
    .sort((a, b) => a.expires_sim_min - b.expires_sim_min);

  const recentRequests = [...state.requests]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const productTotals = PRODUCTS.map((product) => ({
    product,
    units: activeRequests
      .filter((request) => request.product === product)
      .reduce((sum, request) => sum + request.units, 0),
  }));
  const productMax = Math.max(1, ...productTotals.map((item) => item.units));

  const stateCounts = REQUEST_STATES.map((requestState) => ({
    state: requestState,
    count: state.requests.filter((request) => request.state === requestState).length,
  }));

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="نمای عملیات"
        title="داشبورد شبکه اهدای خون"
        description="تصویر لحظه‌ای از درخواست‌ها، موجودی سازگار، اهداکنندگان و وضعیت رسمی تأمین. همه اعداد از داده نمایشی همین مرورگر می‌آیند."
        actions={
          <>
            <Button
              component={Link}
              to="/requests/new"
              leftSection={<Plus size={17} weight="bold" />}
              color="brand"
            >
              ثبت درخواست
            </Button>
            <Button
              component={Link}
              to="/inventory"
              variant="default"
              leftSection={<Drop size={17} weight="fill" />}
            >
              موجودی مراکز
            </Button>
          </>
        }
      />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 3, xl: 5 }} spacing="md">
        <StatCard
          label="درخواست‌های فعال"
          value={formatNumber(activeRequestCount(state))}
          hint={`${formatNumber(criticalRequests.length)} درخواست بحرانی در جریان`}
          icon={<ClipboardText size={21} weight="duotone" />}
          color="brand"
        />
        <StatCard
          label="واحد درخواستی فعال"
          value={formatNumber(neededUnits)}
          hint="مجموع مقدار درخواستی، نه مقدار تأمین‌شده"
          icon={<Heartbeat size={21} weight="duotone" />}
          color="crimson"
        />
        <StatCard
          label="مقدار تخصیص‌یافته"
          value={formatNumber(allocatedUnits)}
          hint="تخصیص موجودی هنوز اهدای واقعی نیست"
          icon={<Drop size={21} weight="duotone" />}
          color="cyan"
        />
        <StatCard
          label="مقدار واقعاً تأمین‌شده"
          value={formatNumber(suppliedUnits)}
          hint="فقط رویداد donated این عدد را افزایش می‌دهد"
          icon={<FirstAidKit size={21} weight="duotone" />}
          color="green"
        />
        <StatCard
          label="دعوت‌های در انتظار پاسخ"
          value={formatNumber(invitedDonors)}
          hint={`${formatNumber(state.donors.length)} اهداکننده در نمونه نمایشی`}
          icon={<UsersThree size={21} weight="duotone" />}
          color="orange"
        />
      </SimpleGrid>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard
              title={
                <Group gap="xs" wrap="nowrap">
                  <Siren size={20} color="#C2413A" weight="fill" aria-hidden="true" />
                  <span>درخواست‌های بحرانی</span>
                </Group>
              }
              description="درخواست‌های فعال با فوریت بحرانی؛ مهلت هدف ۹۰ دقیقه از زمان ثبت است."
              action={
                <Button component={Link} to="/requests" variant="subtle" size="xs" rightSection={<ArrowLeft size={14} />}>
                  همه درخواست‌ها
                </Button>
              }
            >
              {criticalRequests.length === 0 ? (
                <InlineMessage tone="success" title="درخواست بحرانی فعالی وجود ندارد">
                  شبکه در این لحظه درخواست بحرانی بدون تأمین ندارد؛ با این حال وضعیت را به‌صورت زنده پیگیری کنید.
                </InlineMessage>
              ) : (
                <Stack gap="sm">
                  {criticalRequests.slice(0, 3).map((request) => (
                    <Box
                      key={request.id}
                      p="md"
                      className="rounded-xl border border-[#F3D4D1] bg-[#FFF9F8]"
                    >
                      <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
                        <Box className="min-w-0">
                          <Group gap={6} wrap="nowrap">
                            <Text
                              component={Link}
                              to={`/requests/${request.id}`}
                              size="xs"
                              fw={800}
                              c="crimson.8"
                              className="bn-mono"
                              dir="ltr"
                            >
                              {request.id}
                            </Text>
                            <StateBadge state={request.state} size="xs" />
                          </Group>
                          <Text size="sm" fw={700} mt={4}>
                            {request.hospital_name}
                          </Text>
                          <Text size="xs" c="dimmed" mt={2}>
                            {PRODUCT_LABELS[request.product]} · گروه <span className="bn-ltr">{request.blood_group}</span> ·{' '}
                            {formatRelative(request.created_at, state.sim_time)} ثبت شده
                          </Text>
                        </Box>
                        <Stack gap={4} align="flex-end">
                          <Text size="sm" fw={800} className="bn-number">
                            {formatNumber(request.supplied_units)} از {formatNumber(request.units)} واحد
                          </Text>
                          <Progress
                            value={clampPercent(request.supplied_units, request.units)}
                            size={6}
                            radius="xl"
                            color="crimson"
                            w={130}
                            aria-label={`پیشرفت تأمین ${request.id}`}
                          />
                          <Text size="xs" c="dimmed">
                            هدف: {formatNumber(URGENCY_SLA_MINUTES.critical)} دقیقه
                          </Text>
                        </Stack>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              )}
            </SectionCard>

            <Grid gap="lg">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <SectionCard
                  title="ترکیب فرآورده‌ها"
                  description="مجموع واحد درخواستی در درخواست‌های فعال"
                  className="h-full"
                >
                  <Stack gap="md">
                    {productTotals.map((item) => (
                      <Box key={item.product}>
                        <Group justify="space-between" gap="xs" mb={6}>
                          <Group gap={6}>
                            <Box
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: PRODUCT_HEX[item.product] }}
                              aria-hidden="true"
                            />
                            <Text size="sm" fw={600}>
                              {PRODUCT_LABELS[item.product]}
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed" className="bn-number">
                            {formatNumber(item.units)} واحد
                          </Text>
                        </Group>
                        <Progress
                          value={(item.units / productMax) * 100}
                          size={8}
                          radius="xl"
                          color={item.product === 'red_cells' ? 'crimson' : item.product === 'platelets' ? 'orange' : 'cyan'}
                          aria-label={`سهم ${PRODUCT_LABELS[item.product]}`}
                        />
                      </Box>
                    ))}
                  </Stack>
                </SectionCard>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <SectionCard
                  title="توزیع وضعیت رسمی"
                  description="هفت وضعیت قراردادی؛ وضعیت هر درخواست مستقل از رویدادهای اهداکننده است."
                  className="h-full"
                >
                  <Stack gap={9}>
                    {stateCounts.map((item) => (
                      <Group key={item.state} justify="space-between" gap="xs" wrap="nowrap">
                        <StateBadge state={item.state} size="xs" />
                        <Box className="bn-chart-track h-1.5 flex-1" aria-hidden="true">
                          <Box
                            className="bn-chart-fill"
                            style={{
                              width: `${clampPercent(item.count, state.requests.length)}%`,
                              background: '#b91c1c',
                            }}
                          />
                        </Box>
                        <Text size="xs" c="dimmed" className="bn-number w-8 text-end">
                          {formatNumber(item.count)}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </SectionCard>
              </Grid.Col>
            </Grid>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <SectionCard title="اقدام‌های سریع" description="مسیرهای اصلی عملیات">
              <Stack gap="xs">
                {[
                  { to: '/requests/new', label: 'ثبت درخواست بیمارستان', icon: Plus, color: 'brand' },
                  { to: '/inventory', label: 'تخصیص موجودی با FEFO', icon: Drop, color: 'cyan' },
                  { to: '/donor', label: 'پیگیری دعوت اهداکننده', icon: UsersThree, color: 'orange' },
                  { to: '/audit', label: 'مشاهده Audit Trail', icon: ChartBar, color: 'gray' },
                ].map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Button
                      key={item.to}
                      component={Link}
                      to={item.to}
                      variant="light"
                      color={item.color}
                      justify="space-between"
                      fullWidth
                      rightSection={<ArrowLeft size={15} />}
                      leftSection={<IconComponent size={17} weight="duotone" />}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Stack>
            </SectionCard>

            <SectionCard
              title="هشدار انقضای موجودی"
              description={`${formatNumber(expiringItems.length)} ردیف در محدوده کمتر از ۶ ساعت یا منقضی`}
              action={
                <Button component={Link} to="/inventory" variant="subtle" size="xs">
                  مشاهده
                </Button>
              }
            >
              {expiringItems.length === 0 ? (
                <Text size="sm" c="dimmed" lh={1.8}>
                  موجودی نزدیک انقضا در نمونه فعلی وجود ندارد.
                </Text>
              ) : (
                <Stack gap="xs">
                  {expiringItems.slice(0, 4).map((item) => (
                    <Group key={item.id} justify="space-between" gap="xs" wrap="nowrap">
                      <Box className="min-w-0">
                        <Text size="sm" fw={600} truncate>
                          {item.center_name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          <span className="bn-ltr">{item.blood_group}</span> · {PRODUCT_LABELS[item.product]} ·{' '}
                          {formatNumber(item.units)} واحد
                        </Text>
                      </Box>
                      <Badge
                        color={
                          expiryTone(isoFromSimMinute(item.expires_sim_min), state.sim_time) === 'expired'
                            ? 'red'
                            : 'orange'
                        }
                        variant="light"
                        size="xs"
                      >
                        {expiryLabel(isoFromSimMinute(item.expires_sim_min), state.sim_time)}
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              )}
            </SectionCard>

            <SectionCard title="آمادگی مراکز" description="موجودی کل و ردیف‌های نزدیک انقضا">
              <Stack gap="sm">
                {centers.map((center) => {
                  const items = state.inventory.filter((item) => item.center_id === center.id);
                  const units = items.reduce((sum, item) => sum + item.units, 0);
                  const risky = items.filter((item) =>
                    ['critical', 'expired'].includes(
                      expiryTone(isoFromSimMinute(item.expires_sim_min), state.sim_time),
                    ),
                  ).length;
                  return (
                    <Box key={center.id}>
                      <Group justify="space-between" gap="xs" mb={5}>
                        <Group gap={6} wrap="nowrap" className="min-w-0">
                          <Buildings size={15} color="#b91c1c" aria-hidden="true" />
                          <Text size="sm" fw={600} truncate>
                            {center.name}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed" className="bn-number">
                          {formatNumber(units)} واحد
                        </Text>
                      </Group>
                      <Group justify="space-between" gap="xs">
                        <Progress
                          value={clampPercent(units, Math.max(1, availableUnits))}
                          size={5}
                          radius="xl"
                          color="brand"
                          className="flex-1"
                          aria-label={`سهم موجودی ${center.name}`}
                        />
                        {risky > 0 && (
                          <Badge color="orange" variant="light" size="xs">
                            {formatNumber(risky)} هشدار
                          </Badge>
                        )}
                      </Group>
                    </Box>
                  );
                })}
              </Stack>
            </SectionCard>
          </Stack>
        </Grid.Col>
      </Grid>

      <SectionCard
        title="آخرین درخواست‌ها"
        description={`به‌روزرسانی‌شده در ${formatDateTime(state.sim_time)} — ساعت شبیه‌سازی`}
        action={
          <Button component={Link} to="/requests" variant="light" size="sm" rightSection={<ArrowLeft size={15} />}>
            فهرست کامل
          </Button>
        }
        noBodyPadding
      >
        {recentRequests.length > 0 ? (
          <Box p="md">
            <RequestTable requests={recentRequests} now={state.sim_time} />
          </Box>
        ) : (
          <EmptyState
            title="درخواستی ثبت نشده"
            description="اولین درخواست بیمارستان را ثبت کنید تا چرخه تأمین شروع شود."
            action={
              <Button component={Link} to="/requests/new" leftSection={<Plus size={16} />}>
                ثبت درخواست
              </Button>
            }
          />
        )}
      </SectionCard>

      <InlineMessage tone="warning" title="این داشبورد یک نمونه نمایشی است">
        داده‌ها ساختگی‌اند، به Backend واقعی متصل نیستند و مبنای تصمیم پزشکی قرار نمی‌گیرند. برای جزئیات قرارداد،
        حالت Live و محدودیت‌ها به <Link to="/guide" className="font-bold underline">راهنما</Link> مراجعه کنید.
      </InlineMessage>

      <Group gap="xs" justify="center" c="dimmed">
        <Clock size={14} aria-hidden="true" />
        <Text size="xs">
          مبنای زمان: Gateway شبیه‌سازی — {formatDateTime(state.sim_time)}
        </Text>
        <WarningCircle size={14} aria-hidden="true" />
        <Text size="xs">فقط رویداد donated موجودی واقعی می‌سازد.</Text>
      </Group>
    </Stack>
  );
}
