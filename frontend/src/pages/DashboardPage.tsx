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
import { CENTERS } from '../data/seed';
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
  const { state } = useDemoStore();

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
        eyebrow="Ù†Ù…Ø§ÛŒ Ø¹Ù…Ù„ÛŒØ§Øª"
        title="Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯ Ø´Ø¨Ú©Ù‡ Ø§Ù‡Ø¯Ø§ÛŒ Ø®ÙˆÙ†"
        description="ØªØµÙˆÛŒØ± Ù„Ø­Ø¸Ù‡â€ŒØ§ÛŒ Ø§Ø² Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ØŒ Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ø³Ø§Ø²Ú¯Ø§Ø±ØŒ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ú¯Ø§Ù† Ùˆ ÙˆØ¶Ø¹ÛŒØª Ø±Ø³Ù…ÛŒ ØªØ£Ù…ÛŒÙ†. Ù‡Ù…Ù‡ Ø§Ø¹Ø¯Ø§Ø¯ Ø§Ø² Ø¯Ø§Ø¯Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ Ù‡Ù…ÛŒÙ† Ù…Ø±ÙˆØ±Ú¯Ø± Ù…ÛŒâ€ŒØ¢ÛŒÙ†Ø¯."
        actions={
          <>
            <Button
              component={Link}
              to="/requests/new"
              leftSection={<Plus size={17} weight="bold" />}
              color="brand"
            >
              Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª
            </Button>
            <Button
              component={Link}
              to="/inventory"
              variant="default"
              leftSection={<Drop size={17} weight="fill" />}
            >
              Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ù…Ø±Ø§Ú©Ø²
            </Button>
          </>
        }
      />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 3, xl: 5 }} spacing="md">
        <StatCard
          label="Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ ÙØ¹Ø§Ù„"
          value={formatNumber(activeRequestCount(state))}
          hint={`${formatNumber(criticalRequests.length)} Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨Ø­Ø±Ø§Ù†ÛŒ Ø¯Ø± Ø¬Ø±ÛŒØ§Ù†`}
          icon={<ClipboardText size={21} weight="duotone" />}
          color="brand"
        />
        <StatCard
          label="ÙˆØ§Ø­Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³ØªÛŒ ÙØ¹Ø§Ù„"
          value={formatNumber(neededUnits)}
          hint="Ù…Ø¬Ù…ÙˆØ¹ Ù…Ù‚Ø¯Ø§Ø± Ø¯Ø±Ø®ÙˆØ§Ø³ØªÛŒØŒ Ù†Ù‡ Ù…Ù‚Ø¯Ø§Ø± ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡"
          icon={<Heartbeat size={21} weight="duotone" />}
          color="crimson"
        />
        <StatCard
          label="Ù…Ù‚Ø¯Ø§Ø± ØªØ®ØµÛŒØµâ€ŒÛŒØ§ÙØªÙ‡"
          value={formatNumber(allocatedUnits)}
          hint="ØªØ®ØµÛŒØµ Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ù‡Ù†ÙˆØ² Ø§Ù‡Ø¯Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ù†ÛŒØ³Øª"
          icon={<Drop size={21} weight="duotone" />}
          color="cyan"
        />
        <StatCard
          label="Ù…Ù‚Ø¯Ø§Ø± ÙˆØ§Ù‚Ø¹Ø§Ù‹ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡"
          value={formatNumber(suppliedUnits)}
          hint="ÙÙ‚Ø· Ø±ÙˆÛŒØ¯Ø§Ø¯ donated Ø§ÛŒÙ† Ø¹Ø¯Ø¯ Ø±Ø§ Ø§ÙØ²Ø§ÛŒØ´ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯"
          icon={<FirstAidKit size={21} weight="duotone" />}
          color="green"
        />
        <StatCard
          label="Ø¯Ø¹ÙˆØªâ€ŒÙ‡Ø§ÛŒ Ø¯Ø± Ø§Ù†ØªØ¸Ø§Ø± Ù¾Ø§Ø³Ø®"
          value={formatNumber(invitedDonors)}
          hint={`${formatNumber(state.donors.length)} Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡ Ø¯Ø± Ù†Ù…ÙˆÙ†Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ`}
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
                  <span>Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ Ø¨Ø­Ø±Ø§Ù†ÛŒ</span>
                </Group>
              }
              description="Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ ÙØ¹Ø§Ù„ Ø¨Ø§ ÙÙˆØ±ÛŒØª Ø¨Ø­Ø±Ø§Ù†ÛŒØ› Ù…Ù‡Ù„Øª Ù‡Ø¯Ù Û¹Û° Ø¯Ù‚ÛŒÙ‚Ù‡ Ø§Ø² Ø²Ù…Ø§Ù† Ø«Ø¨Øª Ø§Ø³Øª."
              action={
                <Button component={Link} to="/requests" variant="subtle" size="xs" rightSection={<ArrowLeft size={14} />}>
                  Ù‡Ù…Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§
                </Button>
              }
            >
              {criticalRequests.length === 0 ? (
                <InlineMessage tone="success" title="Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨Ø­Ø±Ø§Ù†ÛŒ ÙØ¹Ø§Ù„ÛŒ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯">
                  Ø´Ø¨Ú©Ù‡ Ø¯Ø± Ø§ÛŒÙ† Ù„Ø­Ø¸Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨Ø­Ø±Ø§Ù†ÛŒ Ø¨Ø¯ÙˆÙ† ØªØ£Ù…ÛŒÙ† Ù†Ø¯Ø§Ø±Ø¯Ø› Ø¨Ø§ Ø§ÛŒÙ† Ø­Ø§Ù„ ÙˆØ¶Ø¹ÛŒØª Ø±Ø§ Ø¨Ù‡â€ŒØµÙˆØ±Øª Ø²Ù†Ø¯Ù‡ Ù¾ÛŒÚ¯ÛŒØ±ÛŒ Ú©Ù†ÛŒØ¯.
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
                            {PRODUCT_LABELS[request.product]} Â· Ú¯Ø±ÙˆÙ‡ <span className="bn-ltr">{request.blood_group}</span> Â·{' '}
                            {formatRelative(request.created_at, state.sim_time)} Ø«Ø¨Øª Ø´Ø¯Ù‡
                          </Text>
                        </Box>
                        <Stack gap={4} align="flex-end">
                          <Text size="sm" fw={800} className="bn-number">
                            {formatNumber(request.supplied_units)} Ø§Ø² {formatNumber(request.units)} ÙˆØ§Ø­Ø¯
                          </Text>
                          <Progress
                            value={clampPercent(request.supplied_units, request.units)}
                            size={6}
                            radius="xl"
                            color="crimson"
                            w={130}
                            aria-label={`Ù¾ÛŒØ´Ø±ÙØª ØªØ£Ù…ÛŒÙ† ${request.id}`}
                          />
                          <Text size="xs" c="dimmed">
                            Ù‡Ø¯Ù: {formatNumber(URGENCY_SLA_MINUTES.critical)} Ø¯Ù‚ÛŒÙ‚Ù‡
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
                  title="ØªØ±Ú©ÛŒØ¨ ÙØ±Ø¢ÙˆØ±Ø¯Ù‡â€ŒÙ‡Ø§"
                  description="Ù…Ø¬Ù…ÙˆØ¹ ÙˆØ§Ø­Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³ØªÛŒ Ø¯Ø± Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ ÙØ¹Ø§Ù„"
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
                            {formatNumber(item.units)} ÙˆØ§Ø­Ø¯
                          </Text>
                        </Group>
                        <Progress
                          value={(item.units / productMax) * 100}
                          size={8}
                          radius="xl"
                          color={item.product === 'red_cells' ? 'crimson' : item.product === 'platelets' ? 'orange' : 'cyan'}
                          aria-label={`Ø³Ù‡Ù… ${PRODUCT_LABELS[item.product]}`}
                        />
                      </Box>
                    ))}
                  </Stack>
                </SectionCard>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <SectionCard
                  title="ØªÙˆØ²ÛŒØ¹ ÙˆØ¶Ø¹ÛŒØª Ø±Ø³Ù…ÛŒ"
                  description="Ù‡ÙØª ÙˆØ¶Ø¹ÛŒØª Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ÛŒØ› ÙˆØ¶Ø¹ÛŒØª Ù‡Ø± Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù…Ø³ØªÙ‚Ù„ Ø§Ø² Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§ÛŒ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡ Ø§Ø³Øª."
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
            <SectionCard title="Ø§Ù‚Ø¯Ø§Ù…â€ŒÙ‡Ø§ÛŒ Ø³Ø±ÛŒØ¹" description="Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ø§ØµÙ„ÛŒ Ø¹Ù…Ù„ÛŒØ§Øª">
              <Stack gap="xs">
                {[
                  { to: '/requests/new', label: 'Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨ÛŒÙ…Ø§Ø±Ø³ØªØ§Ù†', icon: Plus, color: 'brand' },
                  { to: '/inventory', label: 'ØªØ®ØµÛŒØµ Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ø¨Ø§ FEFO', icon: Drop, color: 'cyan' },
                  { to: '/donor', label: 'Ù¾ÛŒÚ¯ÛŒØ±ÛŒ Ø¯Ø¹ÙˆØª Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡', icon: UsersThree, color: 'orange' },
                  { to: '/audit', label: 'Ù…Ø´Ø§Ù‡Ø¯Ù‡ Audit Trail', icon: ChartBar, color: 'gray' },
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
              title="Ù‡Ø´Ø¯Ø§Ø± Ø§Ù†Ù‚Ø¶Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ÛŒ"
              description={`${formatNumber(expiringItems.length)} Ø±Ø¯ÛŒÙ Ø¯Ø± Ù…Ø­Ø¯ÙˆØ¯Ù‡ Ú©Ù…ØªØ± Ø§Ø² Û¶ Ø³Ø§Ø¹Øª ÛŒØ§ Ù…Ù†Ù‚Ø¶ÛŒ`}
              action={
                <Button component={Link} to="/inventory" variant="subtle" size="xs">
                  Ù…Ø´Ø§Ù‡Ø¯Ù‡
                </Button>
              }
            >
              {expiringItems.length === 0 ? (
                <Text size="sm" c="dimmed" lh={1.8}>
                  Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ù†Ø²Ø¯ÛŒÚ© Ø§Ù†Ù‚Ø¶Ø§ Ø¯Ø± Ù†Ù…ÙˆÙ†Ù‡ ÙØ¹Ù„ÛŒ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.
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
                          <span className="bn-ltr">{item.blood_group}</span> Â· {PRODUCT_LABELS[item.product]} Â·{' '}
                          {formatNumber(item.units)} ÙˆØ§Ø­Ø¯
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

            <SectionCard title="Ø¢Ù…Ø§Ø¯Ú¯ÛŒ Ù…Ø±Ø§Ú©Ø²" description="Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ú©Ù„ Ùˆ Ø±Ø¯ÛŒÙâ€ŒÙ‡Ø§ÛŒ Ù†Ø²Ø¯ÛŒÚ© Ø§Ù†Ù‚Ø¶Ø§">
              <Stack gap="sm">
                {CENTERS.map((center) => {
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
                          {formatNumber(units)} ÙˆØ§Ø­Ø¯
                        </Text>
                      </Group>
                      <Group justify="space-between" gap="xs">
                        <Progress
                          value={clampPercent(units, Math.max(1, availableUnits))}
                          size={5}
                          radius="xl"
                          color="brand"
                          className="flex-1"
                          aria-label={`Ø³Ù‡Ù… Ù…ÙˆØ¬ÙˆØ¯ÛŒ ${center.name}`}
                        />
                        {risky > 0 && (
                          <Badge color="orange" variant="light" size="xs">
                            {formatNumber(risky)} Ù‡Ø´Ø¯Ø§Ø±
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
        title="Ø¢Ø®Ø±ÛŒÙ† Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§"
        description={`Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒâ€ŒØ´Ø¯Ù‡ Ø¯Ø± ${formatDateTime(state.sim_time)} â€” Ø³Ø§Ø¹Øª Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒ`}
        action={
          <Button component={Link} to="/requests" variant="light" size="sm" rightSection={<ArrowLeft size={15} />}>
            ÙÙ‡Ø±Ø³Øª Ú©Ø§Ù…Ù„
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
            title="Ø¯Ø±Ø®ÙˆØ§Ø³ØªÛŒ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡"
            description="Ø§ÙˆÙ„ÛŒÙ† Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨ÛŒÙ…Ø§Ø±Ø³ØªØ§Ù† Ø±Ø§ Ø«Ø¨Øª Ú©Ù†ÛŒØ¯ ØªØ§ Ú†Ø±Ø®Ù‡ ØªØ£Ù…ÛŒÙ† Ø´Ø±ÙˆØ¹ Ø´ÙˆØ¯."
            action={
              <Button component={Link} to="/requests/new" leftSection={<Plus size={16} />}>
                Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª
              </Button>
            }
          />
        )}
      </SectionCard>

      <InlineMessage tone="warning" title="Ø§ÛŒÙ† Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯ ÛŒÚ© Ù†Ù…ÙˆÙ†Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ Ø§Ø³Øª">
        Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ Ø³Ø§Ø®ØªÚ¯ÛŒâ€ŒØ§Ù†Ø¯ØŒ Ø¨Ù‡ Backend ÙˆØ§Ù‚Ø¹ÛŒ Ù…ØªØµÙ„ Ù†ÛŒØ³ØªÙ†Ø¯ Ùˆ Ù…Ø¨Ù†Ø§ÛŒ ØªØµÙ…ÛŒÙ… Ù¾Ø²Ø´Ú©ÛŒ Ù‚Ø±Ø§Ø± Ù†Ù…ÛŒâ€ŒÚ¯ÛŒØ±Ù†Ø¯. Ø¨Ø±Ø§ÛŒ Ø¬Ø²Ø¦ÛŒØ§Øª Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ØŒ
        Ø­Ø§Ù„Øª Live Ùˆ Ù…Ø­Ø¯ÙˆØ¯ÛŒØªâ€ŒÙ‡Ø§ Ø¨Ù‡ <Link to="/guide" className="font-bold underline">Ø±Ø§Ù‡Ù†Ù…Ø§</Link> Ù…Ø±Ø§Ø¬Ø¹Ù‡ Ú©Ù†ÛŒØ¯.
      </InlineMessage>

      <Group gap="xs" justify="center" c="dimmed">
        <Clock size={14} aria-hidden="true" />
        <Text size="xs">
          Ù…Ø¨Ù†Ø§ÛŒ Ø²Ù…Ø§Ù†: Gateway Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒ â€” {formatDateTime(state.sim_time)}
        </Text>
        <WarningCircle size={14} aria-hidden="true" />
        <Text size="xs">ÙÙ‚Ø· Ø±ÙˆÛŒØ¯Ø§Ø¯ donated Ù…ÙˆØ¬ÙˆØ¯ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ù…ÛŒâ€ŒØ³Ø§Ø²Ø¯.</Text>
      </Group>
    </Stack>
  );
}

