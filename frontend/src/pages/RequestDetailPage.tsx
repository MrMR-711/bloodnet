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
          eyebrow="Ø¬Ø²Ø¦ÛŒØ§Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª"
          title="Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯"
          description={requestId ? `Ø´Ù†Ø§Ø³Ù‡ ${requestId} Ø¯Ø± Ø¯Ø§Ø¯Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.` : 'Ø´Ù†Ø§Ø³Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª.'}
          actions={
            <Button component={Link} to="/requests" variant="default" leftSection={<ArrowRight size={16} />}>
              Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ù‡ ÙÙ‡Ø±Ø³Øª
            </Button>
          }
        />
        <ErrorState
          code="Û´Û°Û´"
          title="Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù…ÙˆØ±Ø¯Ù†Ø¸Ø± Ù…ÙˆØ¬ÙˆØ¯ Ù†ÛŒØ³Øª"
          description="Ù…Ù…Ú©Ù† Ø§Ø³Øª Ø´Ù†Ø§Ø³Ù‡ Ø§Ø´ØªØ¨Ø§Ù‡ Ø¨Ø§Ø´Ø¯ ÛŒØ§ Ø¯Ø§Ø¯Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ Ø¨Ø§Ø²Ù†Ø´Ø§Ù†ÛŒ Ø´Ø¯Ù‡ Ø¨Ø§Ø´Ø¯."
          action={
            <Button component={Link} to="/requests" leftSection={<ArrowRight size={16} />}>
              Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ù‡Ù…Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§
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
      title: 'Ø¹Ù…Ù„ÛŒØ§Øª Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯',
      message: error instanceof DemoError ? error.message : 'Ø®Ø·Ø§ÛŒ Ù†Ø§Ù…Ø´Ø®Øµ Ø¯Ø± Ø­Ø§Ù„Øª Ù†Ù…Ø§ÛŒØ´ÛŒ Ø±Ø® Ø¯Ø§Ø¯.',
      color: 'red',
    });
  };

  const handleApprove = () => {
    try {
      approveRequest(request.id);
      notifications.show({
        title: 'Ø¯Ø±Ø®ÙˆØ§Ø³Øª ØªØ£ÛŒÛŒØ¯ Ø´Ø¯',
        message: 'ÙˆØ¶Ø¹ÛŒØª Ø±Ø³Ù…ÛŒ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨Ù‡ open ØªØºÛŒÛŒØ± Ú©Ø±Ø¯.',
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
        title: 'Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù„ØºÙˆ Ø´Ø¯',
        message: 'Ø¯Ø± ÙˆØ¶Ø¹ÛŒØª Ù†Ù…Ø§ÛŒØ´ÛŒØŒ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡ Ùˆ ØªØ®ØµÛŒØµâ€ŒÙ‡Ø§ ØªØºÛŒÛŒØ± Ù†Ú©Ø±Ø¯Ù†Ø¯.',
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
        title: 'Ø³Ø·Ø­ ÙÙˆØ±ÛŒØª Ø§ØµÙ„Ø§Ø­ Ø´Ø¯',
        message: `ÙÙˆØ±ÛŒØª Ø¬Ø¯ÛŒØ¯: ${URGENCY_LABELS[amendUrgency]}`,
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
        title: 'Ú©Ù„ÛŒØ¯ Ú©Ù¾ÛŒ Ø´Ø¯',
        message: 'Idempotency-Key Ø¯Ø± Ú©Ù„ÛŒÙ¾â€ŒØ¨ÙˆØ±Ø¯ Ù‚Ø±Ø§Ø± Ú¯Ø±ÙØª.',
        color: 'green',
        icon: <Copy size={16} />,
      });
    } catch {
      notifications.show({
        title: 'Ú©Ù¾ÛŒ Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯',
        message: 'Ù…Ø±ÙˆØ±Ú¯Ø± Ø§Ø¬Ø§Ø²Ù‡ Ø¯Ø³ØªØ±Ø³ÛŒ Ø¨Ù‡ Ú©Ù„ÛŒÙ¾â€ŒØ¨ÙˆØ±Ø¯ Ø±Ø§ Ù†Ø¯Ø§Ø¯.',
        color: 'orange',
      });
    }
  };

  const counterRows = [
    { label: 'needed â€” Ù…Ù‚Ø¯Ø§Ø± Ø¯Ø±Ø®ÙˆØ§Ø³ØªÛŒ', value: request.counters.needed, color: 'brand' },
    { label: 'confirmed â€” Ù¾Ø°ÛŒØ±Ø´ Ø¯Ø¹ÙˆØª', value: request.counters.confirmed, color: 'cyan' },
    { label: 'en_route â€” Ø¯Ø± Ù…Ø³ÛŒØ±', value: request.counters.en_route, color: 'indigo' },
    { label: 'arrived â€” Ø±Ø³ÛŒØ¯Ù‡', value: request.counters.arrived, color: 'orange' },
    { label: 'fulfilled â€” Ø§Ù‡Ø¯Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ', value: request.counters.fulfilled, color: 'green' },
  ];

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Ø¬Ø²Ø¦ÛŒØ§Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª"
        title={<span className="bn-mono bn-ltr">{request.id}</span>}
        description={
          <span>
            {request.hospital_name} Â· {PRODUCT_LABELS[request.product]} Â· Ú¯Ø±ÙˆÙ‡{' '}
            <span className="bn-ltr">{request.blood_group}</span>
          </span>
        }
        actions={
          <>
            <Button component={Link} to="/requests" variant="default" leftSection={<ArrowRight size={16} />}>
              ÙÙ‡Ø±Ø³Øª
            </Button>
            {request.state === 'pending_review' && (
              <Button color="green" onClick={handleApprove} leftSection={<CheckCircle size={16} />}>
                ØªØ£ÛŒÛŒØ¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øª
              </Button>
            )}
            {!terminal && (
              <>
                <Button
                  component={Link}
                  to={`/inventory?request=${request.id}`}
                  leftSection={<Truck size={16} />}
                >
                  ØªØ®ØµÛŒØµ Ù…ÙˆØ¬ÙˆØ¯ÛŒ
                </Button>
                <Button
                  variant="default"
                  leftSection={<PencilSimple size={16} />}
                  onClick={() => {
                    setAmendUrgency(request.urgency);
                    setAmendOpen(true);
                  }}
                >
                  Ø§ØµÙ„Ø§Ø­ ÙÙˆØ±ÛŒØª
                </Button>
                <Button
                  variant="subtle"
                  color="crimson"
                  leftSection={<Prohibit size={16} />}
                  onClick={() => setCancelOpen(true)}
                >
                  Ù„ØºÙˆ
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

      <InlineMessage tone={request.supplied_units > 0 ? 'warning' : 'info'} title="ØªØ£Ù…ÛŒÙ† ÙˆØ§Ù‚Ø¹ÛŒ Ø¨Ø§ ØªØ®ØµÛŒØµ ÛŒØ§ Ù¾Ø°ÛŒØ±Ø´ Ø¯Ø¹ÙˆØª Ø¨Ø±Ø§Ø¨Ø± Ù†ÛŒØ³Øª">
        Â«Ù…Ù‚Ø¯Ø§Ø± ÙˆØ§Ù‚Ø¹Ø§Ù‹ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡Â» ÙÙ‚Ø· Ø¨Ø§ Ø±ÙˆÛŒØ¯Ø§Ø¯ <span className="bn-mono bn-ltr">donated</span> Ø§ÙØ²Ø§ÛŒØ´ Ù…ÛŒâ€ŒÛŒØ§Ø¨Ø¯.
        Ù¾Ø°ÛŒØ±Ø´ Ø¯Ø¹ÙˆØªØŒ Ø­Ø±Ú©Øª Ø¨Ù‡ Ù…Ø±Ú©Ø²ØŒ Ø±Ø³ÛŒØ¯Ù†ØŒ Ù‚Ø¨ÙˆÙ„ÛŒ ØºØ±Ø¨Ø§Ù„Ú¯Ø±ÛŒ ÛŒØ§ ØªØ®ØµÛŒØµ Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ù‡ÛŒÚ†â€ŒÚ©Ø¯Ø§Ù… Ø§Ù‡Ø¯Ø§ Ù…Ø­Ø³ÙˆØ¨ Ù†Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
      </InlineMessage>

      <SimpleGrid cols={{ base: 1, xs: 2, md: 5 }} spacing="md">
        <StatCard
          label="Ù…Ù‚Ø¯Ø§Ø± Ø¯Ø±Ø®ÙˆØ§Ø³ØªÛŒ"
          value={formatNumber(request.units)}
          hint="ÙÛŒÙ„Ø¯ units Ø¯Ø± Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯"
          icon={<ClipboardText size={21} weight="duotone" />}
          color="brand"
        />
        <StatCard
          label="Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ø³Ø§Ø²Ú¯Ø§Ø± Ù‚Ø§Ø¨Ù„ ØªØ®ØµÛŒØµ"
          value={formatNumber(compatibleUnits)}
          hint="Ù…ÙˆØ¬ÙˆØ¯ÛŒ ÙØ¹Ù„ÛŒ Ø¨Ø§ Ù…Ø§ØªØ±ÛŒØ³ Ø±Ø³Ù…ÛŒ"
          icon={<Drop size={21} weight="duotone" />}
          color="cyan"
        />
        <StatCard
          label="Ù…Ù‚Ø¯Ø§Ø± ØªØ®ØµÛŒØµâ€ŒÛŒØ§ÙØªÙ‡"
          value={formatNumber(request.allocated_units)}
          hint="ØªØ®ØµÛŒØµ Ù…ÙˆØ¬ÙˆØ¯ÛŒØ› Ù‡Ù†ÙˆØ² Ø§Ù‡Ø¯Ø§ Ù†ÛŒØ³Øª"
          icon={<Truck size={21} weight="duotone" />}
          color="indigo"
        />
        <StatCard
          label="Ù…Ù‚Ø¯Ø§Ø± ÙˆØ§Ù‚Ø¹Ø§Ù‹ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡"
          value={formatNumber(request.supplied_units)}
          hint="ÙÙ‚Ø· Ø±ÙˆÛŒØ¯Ø§Ø¯ donated"
          icon={<FirstAidKit size={21} weight="duotone" />}
          color="green"
        />
        <StatCard
          label="Ù…Ù‚Ø¯Ø§Ø± Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡"
          value={formatNumber(remaining)}
          hint="Ø¯Ø±Ø®ÙˆØ§Ø³ØªÛŒ Ù…Ù†Ù‡Ø§ÛŒ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡"
          icon={<Heartbeat size={21} weight="duotone" />}
          color={remaining > 0 ? 'crimson' : 'green'}
        />
      </SimpleGrid>

      <Grid gap="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard title="ÙˆØ¶Ø¹ÛŒØª Ø±Ø³Ù…ÛŒ Ùˆ Ø´Ù…Ø§Ø±Ù†Ø¯Ù‡â€ŒÙ‡Ø§" description={STATE_DESCRIPTIONS[request.state]}>
              <Stack gap="md">
                <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
                  <Group gap="sm">
                    <StateBadge state={request.state} size="lg" />
                    <Badge color={slaRemaining > 0 ? 'orange' : 'red'} variant="light" size="lg">
                      {slaRemaining > 0
                        ? `${formatDuration(slaRemaining)} ØªØ§ Ù‡Ø¯Ù ${URGENCY_LABELS[request.urgency]}`
                        : 'Ù…Ù‡Ù„Øª Ù‡Ø¯Ù Ú¯Ø°Ø´ØªÙ‡ Ø§Ø³Øª'}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Ø¢Ø®Ø±ÛŒÙ† Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ: {formatRelative(request.updated_at, state.sim_time)}
                  </Text>
                </Group>

                <Box>
                  <Group justify="space-between" mb={6}>
                    <Text size="xs" c="dimmed">
                      Ù¾ÛŒØ´Ø±ÙØª ØªØ£Ù…ÛŒÙ† ÙˆØ§Ù‚Ø¹ÛŒ
                    </Text>
                    <Text size="xs" fw={700} className="bn-number">
                      {formatNumber(request.supplied_units)} / {formatNumber(request.units)} â€”{' '}
                      {formatPercent(request.supplied_units, request.units)}
                    </Text>
                  </Group>
                  <Progress
                    value={clampPercent(request.supplied_units, request.units)}
                    size={10}
                    radius="xl"
                    color={request.supplied_units >= request.units ? 'green' : 'brand'}
                    aria-label="Ù¾ÛŒØ´Ø±ÙØª ØªØ£Ù…ÛŒÙ† ÙˆØ§Ù‚Ø¹ÛŒ"
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
                  Ø´Ù…Ø§Ø±Ù†Ø¯Ù‡â€ŒÙ‡Ø§ÛŒ <span className="bn-mono bn-ltr">RequestState</span> Ù…Ø³ØªÙ‚Ù„â€ŒØ§Ù†Ø¯Ø› Ù‡ÛŒÚ†â€ŒÚ©Ø¯Ø§Ù… Ø¨Ù‡â€ŒØªÙ†Ù‡Ø§ÛŒÛŒ
                  Ø¨Ù‡â€ŒÙ…Ø¹Ù†Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ÛŒ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡ Ù†ÛŒØ³Øª.
                </Text>
              </Stack>
            </SectionCard>

            <SectionCard title="Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡" description="Ù…Ù‚Ø§Ø¯ÛŒØ± Ù…Ø·Ø§Ø¨Ù‚ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ø±Ø³Ù…ÛŒ">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <InfoRow label="Ø¨ÛŒÙ…Ø§Ø±Ø³ØªØ§Ù†" value={request.hospital_name} />
                <InfoRow
                  label="Ø´Ù†Ø§Ø³Ù‡ Ø¨ÛŒÙ…Ø§Ø±Ø³ØªØ§Ù†"
                  value={<span className="bn-mono bn-ltr">{request.hospital_id}</span>}
                />
                <InfoRow label="ÙØ±Ø¢ÙˆØ±Ø¯Ù‡" value={PRODUCT_LABELS[request.product]} />
                <InfoRow
                  label="Ú¯Ø±ÙˆÙ‡ Ø®ÙˆÙ†ÛŒ Ú¯ÛŒØ±Ù†Ø¯Ù‡"
                  value={<span className="bn-ltr">{request.blood_group}</span>}
                />
                <InfoRow label="ØªØ¹Ø¯Ø§Ø¯ ÙˆØ§Ø­Ø¯" value={formatNumber(request.units)} />
                <InfoRow label="Ø³Ø·Ø­ ÙÙˆØ±ÛŒØª" value={URGENCY_LABELS[request.urgency]} />
                <InfoRow label="Ø²Ù…Ø§Ù† Ø«Ø¨Øª" value={formatDateTime(request.created_at)} />
                <InfoRow label="Ø¢Ø®Ø±ÛŒÙ† Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ" value={formatDateTime(request.updated_at)} />
                <InfoRow
                  label="ÛŒØ§Ø¯Ø¯Ø§Ø´Øª"
                  value={request.note || 'Ø¨Ø¯ÙˆÙ† ÛŒØ§Ø¯Ø¯Ø§Ø´Øª'}
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
                        Ú©Ù¾ÛŒ
                      </Button>
                    </Group>
                  }
                  fullWidth
                />
              </SimpleGrid>
            </SectionCard>

            <SectionCard
              title="ØªØ®ØµÛŒØµâ€ŒÙ‡Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ÛŒ"
              description={`${formatNumber(dispatches.length)} ØªØ®ØµÛŒØµ Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡ â€” FEFO Ùˆ ETA Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒ`}
              action={
                !terminal && (
                  <Button
                    component={Link}
                    to={`/inventory?request=${request.id}`}
                    variant="light"
                    size="xs"
                    leftSection={<Truck size={14} />}
                  >
                    ØªØ®ØµÛŒØµ Ø¬Ø¯ÛŒØ¯
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
                        <Table.Th>Ø´Ù†Ø§Ø³Ù‡</Table.Th>
                        <Table.Th>Ù…Ø±Ú©Ø²</Table.Th>
                        <Table.Th>Ú¯Ø±ÙˆÙ‡ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡</Table.Th>
                        <Table.Th>ÙˆØ§Ø­Ø¯</Table.Th>
                        <Table.Th>ETA</Table.Th>
                        <Table.Th>ÙˆØ¶Ø¹ÛŒØª</Table.Th>
                        <Table.Th>Ø²Ù…Ø§Ù†</Table.Th>
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
                  title="Ù‡Ù†ÙˆØ² Ù…ÙˆØ¬ÙˆØ¯ÛŒ ØªØ®ØµÛŒØµ Ù†ÛŒØ§ÙØªÙ‡"
                  description="Ø§Ø² ØµÙØ­Ù‡ Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ù…Ø±Ø§Ú©Ø²ØŒ Ø±Ø¯ÛŒÙ Ø³Ø§Ø²Ú¯Ø§Ø± Ø¨Ø§ Ù†Ø²Ø¯ÛŒÚ©â€ŒØªØ±ÛŒÙ† Ø§Ù†Ù‚Ø¶Ø§ Ø±Ø§ Ø§Ù†ØªØ®Ø§Ø¨ Ú©Ù†ÛŒØ¯."
                  icon={<Truck size={24} />}
                  action={
                    !terminal && (
                      <Button component={Link} to={`/inventory?request=${request.id}`} leftSection={<Drop size={16} />}>
                        Ø±ÙØªÙ† Ø¨Ù‡ Ù…ÙˆØ¬ÙˆØ¯ÛŒ
                      </Button>
                    )
                  }
                />
              )}
            </SectionCard>

            <SectionCard
              title="Ø¯Ø¹ÙˆØªâ€ŒÙ‡Ø§ÛŒ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡"
              description={`${formatNumber(donors.length)} Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡ Ù…Ø±ØªØ¨Ø· Ø¨Ø§ Ø§ÛŒÙ† Ø¯Ø±Ø®ÙˆØ§Ø³Øª`}
              action={
                <Button component={Link} to="/donor" variant="subtle" size="xs" leftSection={<UsersThree size={14} />}>
                  Ù¾ÙˆØ±ØªØ§Ù„ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡
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
                            {donor.center_name} Â· {formatNumber(1)} ÙˆØ§Ø­Ø¯ Â· {donor.phone_masked}
                          </Text>
                        </Box>
                        <Group gap={6}>
                          <DonorStatusBadge status={donor.status} />
                          <GatewayStatusBadge status={donor.gateway_status} />
                        </Group>
                      </Group>
                      <Group justify="space-between" mt={8}>
                        <Text size="xs" c="dimmed">
                          Ø¢Ø®Ø±ÛŒÙ† Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ: {formatRelative(donor.updated_at, state.sim_time)}
                        </Text>
                        <Button component={Link} to={`/donor?donor=${donor.id}`} variant="subtle" size="compact-xs">
                          Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¯Ø± Ù¾ÙˆØ±ØªØ§Ù„
                        </Button>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed" lh={1.8}>
                  Ù‡Ù†ÙˆØ² Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡â€ŒØ§ÛŒ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¯Ø¹ÙˆØª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª. Ø¯Ø¹ÙˆØª Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡ Ù…ÙˆØ¬ÙˆØ¯ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
                </Text>
              )}
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <SectionCard title="Ø§Ù‚Ø¯Ø§Ù…â€ŒÙ‡Ø§ÛŒ Ù…Ø¬Ø§Ø²" description="Ø¨Ø± Ø§Ø³Ø§Ø³ ÙˆØ¶Ø¹ÛŒØª Ø±Ø³Ù…ÛŒ Ùˆ Ù†Ù‚Ø´ Ù†Ù…Ø§ÛŒØ´ÛŒ">
              <Stack gap="xs">
                {request.state === 'pending_review' ? (
                  <Button color="green" fullWidth leftSection={<CheckCircle size={17} />} onClick={handleApprove}>
                    ØªØ£ÛŒÛŒØ¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øª
                  </Button>
                ) : (
                  <Text size="xs" c="dimmed" lh={1.8}>
                    ØªØ£ÛŒÛŒØ¯ ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Ø¯Ø±Ø®ÙˆØ§Ø³Øª <span className="bn-mono bn-ltr">pending_review</span> Ùˆ Ø¨Ø§ ØªÙˆÚ©Ù†
                    Ù‡Ù…Ø§Ù‡Ù†Ú¯â€ŒÚ©Ù†Ù†Ø¯Ù‡ Ù…Ø¬Ø§Ø² Ø§Ø³Øª.
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
                      ØªØ®ØµÛŒØµ Ù…ÙˆØ¬ÙˆØ¯ÛŒ
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
                      Ø§ØµÙ„Ø§Ø­ ÙÙˆØ±ÛŒØª
                    </Button>
                    <Button
                      variant="subtle"
                      color="crimson"
                      fullWidth
                      leftSection={<Prohibit size={17} />}
                      onClick={() => setCancelOpen(true)}
                    >
                      Ù„ØºÙˆ Ø¯Ø±Ø®ÙˆØ§Ø³Øª
                    </Button>
                  </>
                ) : (
                  <InlineMessage tone="info" title="Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¯Ø± ÙˆØ¶Ø¹ÛŒØª Ù†Ù‡Ø§ÛŒÛŒ Ø§Ø³Øª">
                    Ø¯Ø± ÙˆØ¶Ø¹ÛŒØª <span className="bn-mono bn-ltr">{request.state}</span> Ø§Ù…Ú©Ø§Ù† Ù„ØºÙˆØŒ Ø§ØµÙ„Ø§Ø­ ÛŒØ§ ØªØ®ØµÛŒØµ
                    Ø¬Ø¯ÛŒØ¯ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.
                  </InlineMessage>
                )}
              </Stack>
            </SectionCard>

            <SectionCard title="Ø®Ù„Ø§ØµÙ‡ Ø¹Ù…Ù„ÛŒØ§Øª">
              <Stack gap="sm">
                <SummaryRow icon={<MapPin size={16} />} label="Ø¨ÛŒÙ…Ø§Ø±Ø³ØªØ§Ù†" value={request.hospital_name} />
                <SummaryRow
                  icon={<Siren size={16} />}
                  label="ÙÙˆØ±ÛŒØª"
                  value={`${URGENCY_LABELS[request.urgency]} â€” Ù‡Ø¯Ù ${formatDuration(slaMinutes)}`}
                />
                <SummaryRow
                  icon={<Clock size={16} />}
                  label="Ø²Ù…Ø§Ù† Ø³Ù¾Ø±ÛŒâ€ŒØ´Ø¯Ù‡"
                  value={formatDuration(elapsedMinutes)}
                />
                <SummaryRow
                  icon={<Drop size={16} />}
                  label="Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ø³Ø§Ø²Ú¯Ø§Ø±"
                  value={`${formatNumber(compatibleUnits)} ÙˆØ§Ø­Ø¯`}
                />
                <SummaryRow
                  icon={<FirstAidKit size={16} />}
                  label="ØªØ£Ù…ÛŒÙ† ÙˆØ§Ù‚Ø¹ÛŒ"
                  value={`${formatNumber(request.supplied_units)} Ø§Ø² ${formatNumber(request.units)} ÙˆØ§Ø­Ø¯`}
                />
              </Stack>
            </SectionCard>

            <SectionCard title="ØªØ§ÛŒÙ…â€ŒÙ„Ø§ÛŒÙ† Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§" description="Ø¢Ø®Ø±ÛŒÙ† Û±Û° Ø±ÙˆÛŒØ¯Ø§Ø¯ Ù…Ø±ØªØ¨Ø· Ø¨Ø§ Ø¯Ø±Ø®ÙˆØ§Ø³Øª">
              {events.length > 0 ? (
                <Box className="bn-timeline-line">
                  <Stack gap="md">
                    {events.map((event) => (
                      <Group key={event.id} align="flex-start" gap="sm" wrap="nowrap">
                        <Box
                          className="mt-1 h-2.5 w-2.5 flex-none rounded-full"
                          style={{ background: event.actor_role === 'donor' ? '#be123c' : '#b91c1c' }}
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
                            {formatDateTime(event.at)} Â· {event.actor}
                          </Text>
                        </Box>
                      </Group>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Text size="sm" c="dimmed" lh={1.8}>
                  Ø±ÙˆÛŒØ¯Ø§Ø¯ÛŒ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª.
                </Text>
              )}
            </SectionCard>

            <InlineMessage tone="warning" title="ÛŒØ§Ø¯Ø¢ÙˆØ±ÛŒ Ø¯Ø§Ù…Ù†Ù‡">
              Ø§ÛŒÙ† Ø¯Ø§Ø¯Ù‡ Ø³Ø§Ø®ØªÚ¯ÛŒ Ø§Ø³Øª Ùˆ Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ø¨Ø§Ù„ÛŒÙ†ÛŒ Ù†ÛŒØ³Øª. Ø¨Ø±Ø§ÛŒ ØªØµÙ…ÛŒÙ… ÙˆØ§Ù‚Ø¹ÛŒØŒ Ø¨Ù‡ Ø³Ø§Ù…Ø§Ù†Ù‡ Ø±Ø³Ù…ÛŒ Ùˆ Ù…Ø§ØªØ±ÛŒØ³ Ø³Ø§Ø²Ú¯Ø§Ø±ÛŒ
              Ù…Ø¹ØªØ¨Ø± Ù…Ø±Ø§Ø¬Ø¹Ù‡ Ú©Ù†ÛŒØ¯.
            </InlineMessage>
          </Stack>
        </Grid.Col>
      </Grid>

      <Modal opened={cancelOpen} onClose={() => setCancelOpen(false)} title="Ù„ØºÙˆ Ø¯Ø±Ø®ÙˆØ§Ø³Øª" centered>
        <Stack gap="md">
          <Text size="sm" lh={1.8}>
            Ø¢ÛŒØ§ Ø§Ø² Ù„ØºÙˆ Ø¯Ø±Ø®ÙˆØ§Ø³Øª <span className="bn-mono bn-ltr">{request.id}</span> Ù…Ø·Ù…Ø¦Ù† Ù‡Ø³ØªÛŒØ¯ØŸ Ø¯Ø± Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ ÙˆØ§Ù‚Ø¹ÛŒ
            Ù„ØºÙˆ ØªÚ©Ø±Ø§Ø±ÛŒ Ù¾Ø§Ø³Ø® Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ± Ù…ÛŒâ€ŒØ¯Ù‡Ø¯Ø› Ø¯Ø± Ø§ÛŒÙ† Ù†Ù…Ø§ÛŒØ´ØŒ ÙˆØ¶Ø¹ÛŒØª Ø¨Ù‡ cancelled ØªØºÛŒÛŒØ± Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
          </Text>
          <InlineMessage tone="warning" title="Ù„ØºÙˆ Ø¨Ù‡â€ŒÙ…Ø¹Ù†Ø§ÛŒ Ø¨Ø§Ø²Ú¯Ø´Øª Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ù†ÛŒØ³Øª">
            Ø§ÛŒÙ† Ø¹Ù…Ù„ÛŒØ§Øª Ù†Ù…Ø§ÛŒØ´ÛŒ Ù…ÙˆØ¬ÙˆØ¯ÛŒ ØªØ®ØµÛŒØµâ€ŒÛŒØ§ÙØªÙ‡ Ø±Ø§ Ø¨Ø±Ù†Ù…ÛŒâ€ŒÚ¯Ø±Ø¯Ø§Ù†Ø¯ Ùˆ ÙÙ‚Ø· ÙˆØ¶Ø¹ÛŒØª Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø±Ø§ ØªØºÛŒÛŒØ± Ù…ÛŒâ€ŒØ¯Ù‡Ø¯.
          </InlineMessage>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setCancelOpen(false)}>
              Ø§Ù†ØµØ±Ø§Ù
            </Button>
            <Button color="crimson" onClick={handleCancel} leftSection={<Prohibit size={16} />}>
              Ù„ØºÙˆ Ú©Ù†
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={amendOpen} onClose={() => setAmendOpen(false)} title="Ø§ØµÙ„Ø§Ø­ Ø³Ø·Ø­ ÙÙˆØ±ÛŒØª" centered>
        <Stack gap="md">
          <Text size="sm" lh={1.8}>
            Ø¯Ø± Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ø±Ø³Ù…ÛŒØŒ Ø¨Ø¯Ù†Ù‡ Ø§ØµÙ„Ø§Ø­ ÙÙ‚Ø· ÙÛŒÙ„Ø¯ <span className="bn-mono bn-ltr">urgency</span> Ø±Ø§ Ù…ÛŒâ€ŒÙ¾Ø°ÛŒØ±Ø¯.
          </Text>
          <Box>
            <Text size="sm" fw={600} mb={6}>
              Ø³Ø·Ø­ ÙÙˆØ±ÛŒØª Ø¬Ø¯ÛŒØ¯
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
              Ù‡Ø¯Ù Ø²Ù…Ø§Ù†ÛŒ: {formatDuration(URGENCY_SLA_MINUTES[amendUrgency])}
            </Text>
          </Box>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setAmendOpen(false)}>
              Ø§Ù†ØµØ±Ø§Ù
            </Button>
            <Button color="brand" onClick={handleAmend}>
              Ø«Ø¨Øª Ø§ØµÙ„Ø§Ø­
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

