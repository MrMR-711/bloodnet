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
  { key: 'invited', label: 'Ø¯Ø¹ÙˆØª', icon: <Envelope size={14} /> },
  { key: 'accepted', label: 'Ù¾Ø°ÛŒØ±Ø´', icon: <Check size={14} /> },
  { key: 'en_route', label: 'Ø¯Ø± Ù…Ø³ÛŒØ±', icon: <Truck size={14} /> },
  { key: 'arrived', label: 'Ø±Ø³ÛŒØ¯Ù†', icon: <MapPin size={14} /> },
  { key: 'screen_pass', label: 'ØºØ±Ø¨Ø§Ù„Ú¯Ø±ÛŒ', icon: <ShieldCheck size={14} /> },
  { key: 'donated', label: 'Ø§Ù‡Ø¯Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ', icon: <Drop size={14} weight="fill" /> },
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
      title: 'Ø¹Ù…Ù„ÛŒØ§Øª Ø§Ù†Ø¬Ø§Ù… Ù†Ø´Ø¯',
      message: error instanceof DemoError ? error.message : 'Ø®Ø·Ø§ÛŒ Ù†Ø§Ù…Ø´Ø®Øµ Ø¯Ø± Ø­Ø§Ù„Øª Ù†Ù…Ø§ÛŒØ´ÛŒ Ø±Ø® Ø¯Ø§Ø¯.',
      color: 'red',
    });
  };

  const handleResponse = (response: 'accepted' | 'declined') => {
    if (!selectedDonor) return;
    try {
      respondDonor(selectedDonor.id, response);
      notifications.show({
        title: response === 'accepted' ? 'Ø¯Ø¹ÙˆØª Ù¾Ø°ÛŒØ±ÙØªÙ‡ Ø´Ø¯' : 'Ø¯Ø¹ÙˆØª Ø±Ø¯ Ø´Ø¯',
        message:
          response === 'accepted'
            ? 'Ù¾Ø°ÛŒØ±Ø´ Ø¯Ø¹ÙˆØª ÙÙ‚Ø· Ø´Ù…Ø§Ø±Ù†Ø¯Ù‡ confirmed Ø±Ø§ ØªØºÛŒÛŒØ± Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ Ùˆ Ø§Ù‡Ø¯Ø§ Ù…Ø­Ø³ÙˆØ¨ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.'
            : 'Ø±Ø¯ Ø¯Ø¹ÙˆØª Ù‡ÛŒÚ† ØªØ£Ø«ÛŒØ±ÛŒ Ø¨Ø± Ù…Ù‚Ø¯Ø§Ø± ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡ Ù†Ø¯Ø§Ø±Ø¯.',
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
        title: progress === 'donated' ? 'Ø§Ù‡Ø¯Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ø«Ø¨Øª Ø´Ø¯' : 'Ø±ÙˆÛŒØ¯Ø§Ø¯ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡ Ø«Ø¨Øª Ø´Ø¯',
        message:
          progress === 'donated'
            ? 'ÙÙ‚Ø· Ø§ÛŒÙ† Ø±ÙˆÛŒØ¯Ø§Ø¯ Ù…Ù‚Ø¯Ø§Ø± Â«ÙˆØ§Ù‚Ø¹Ø§Ù‹ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡Â» Ø±Ø§ ÛŒÚ© ÙˆØ§Ø­Ø¯ Ø§ÙØ²Ø§ÛŒØ´ Ø¯Ø§Ø¯.'
            : 'Ø§ÛŒÙ† Ø±ÙˆÛŒØ¯Ø§Ø¯ Ù…Ù‚Ø¯Ø§Ø± ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡ Ø±Ø§ ØªØºÛŒÛŒØ± Ù†Ù…ÛŒâ€ŒØ¯Ù‡Ø¯.',
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
        eyebrow="Ù…Ø³ÛŒØ± Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡"
        title="Ù¾ÙˆØ±ØªØ§Ù„ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡"
        description="Ø¯Ø¹ÙˆØªØŒ Ù¾Ø°ÛŒØ±Ø´ØŒ Ø­Ø±Ú©ØªØŒ Ø±Ø³ÛŒØ¯Ù†ØŒ ØºØ±Ø¨Ø§Ù„Ú¯Ø±ÛŒ Ùˆ Ø§Ù‡Ø¯Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§ÛŒ Ù…Ø³ØªÙ‚Ù„â€ŒØ§Ù†Ø¯. ÙÙ‚Ø· Ø«Ø¨Øª donated Ù…ÙˆØ¬ÙˆØ¯ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ù…ÛŒâ€ŒØ³Ø§Ø²Ø¯."
        actions={
          <Button component={Link} to="/inventory" variant="default" leftSection={<Drop size={17} weight="fill" />}>
            Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ù…Ø±Ø§Ú©Ø²
          </Button>
        }
      />

      {!selectedDonor ? (
        <EmptyState
          title="Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡â€ŒØ§ÛŒ Ø¯Ø± Ù†Ù…ÙˆÙ†Ù‡ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯"
          description="Ø¯Ø§Ø¯Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ Ø±Ø§ Ø§Ø² Ù…Ù†ÙˆÛŒ Ú©Ø§Ø±Ø¨Ø± Ø¨Ø§Ø²Ù†Ø´Ø§Ù†ÛŒ Ú©Ù†ÛŒØ¯ ÛŒØ§ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¬Ø¯ÛŒØ¯ÛŒ Ø«Ø¨Øª Ú©Ù†ÛŒØ¯."
          icon={<UsersThree size={26} />}
          action={
            <Button component={Link} to="/requests/new" leftSection={<ArrowRight size={16} />}>
              Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¬Ø¯ÛŒØ¯
            </Button>
          }
        />
      ) : (
        <Grid gap="lg">
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="lg">
              <SectionCard title="Ø§Ù†ØªØ®Ø§Ø¨ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡" description={`${formatNumber(state.donors.length)} Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ`}>
                <Select
                  label="Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡"
                  value={selectedDonor.id}
                  onChange={(value) => value && setSelectedDonorId(value)}
                  data={state.donors.map((donor) => ({
                    value: donor.id,
                    label: `${donor.name} â€” ${donor.blood_group} â€” ${DONOR_STATUS_LABELS[donor.status]}`,
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

              <InlineMessage tone="info" title="Ù¾Ø°ÛŒØ±Ø´ Ø¯Ø¹ÙˆØª â‰  Ø§Ù‡Ø¯Ø§">
                Ø¯Ø¹ÙˆØª Ø´Ø¯Ù†ØŒ Ù¾Ø°ÛŒØ±ÙØªÙ†ØŒ Ø­Ø±Ú©Øª Ø¨Ù‡ Ù…Ø±Ú©Ø²ØŒ Ø±Ø³ÛŒØ¯Ù† ÛŒØ§ Ù‚Ø¨ÙˆÙ„ÛŒ ØºØ±Ø¨Ø§Ù„Ú¯Ø±ÛŒ Ù‡ÛŒÚ†â€ŒÚ©Ø¯Ø§Ù… Ø¨Ø§Ø¹Ø« Ø§ÙØ²Ø§ÛŒØ´ Â«Ù…Ù‚Ø¯Ø§Ø± ÙˆØ§Ù‚Ø¹Ø§Ù‹
                ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡Â» Ù†Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯. ÙÙ‚Ø· Ø±ÙˆÛŒØ¯Ø§Ø¯ <span className="bn-mono bn-ltr">donated</span> Ø§ÛŒÙ† Ú©Ø§Ø± Ø±Ø§ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
              </InlineMessage>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="lg">
              <SectionCard
                title="Ú©Ø§Ø±Øª Ø¯Ø¹ÙˆØª Ø§Ù‡Ø¯Ø§"
                description="Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ù‡ÙˆÛŒØªÛŒ Ù†Ù…Ø§ÛŒØ´ÛŒ Ùˆ ÙˆØ¶Ø¹ÛŒØª Ù¾ÛŒØ§Ù… Gateway"
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
                        Ø¯Ø¹ÙˆØª: {formatRelative(selectedDonor.invited_at, state.sim_time)}
                      </Text>
                    </Stack>
                  </Group>

                  <Divider />

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    <InfoLine label="Ø´Ù†Ø§Ø³Ù‡ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡" value={selectedDonor.id} mono />
                    <InfoLine label="ÙØ±Ø¢ÙˆØ±Ø¯Ù‡" value={PRODUCT_LABELS[selectedDonor.product]} />
                    <InfoLine label="Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù…Ø±ØªØ¨Ø·" value={selectedDonor.request_id} mono />
                    <InfoLine label="Ø¢Ø®Ø±ÛŒÙ† Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ" value={formatDateTime(selectedDonor.updated_at)} />
                  </SimpleGrid>

                  {request && (
                    <Box className="rounded-xl border border-[var(--bn-border)] bg-[#fff8f8] p-3">
                      <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
                        <Box>
                          <Group gap={6} wrap="nowrap">
                            <Text size="xs" c="dimmed">
                              Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù…Ø±ØªØ¨Ø·
                            </Text>
                            <StateBadge state={request.state} size="xs" />
                          </Group>
                          <Text size="sm" fw={700} mt={3}>
                            {request.hospital_name}
                          </Text>
                          <Group gap={6} mt={4}>
                            <ProductBadge product={request.product} size="xs" />
                            <Text size="xs" c="dimmed">
                              {formatNumber(request.supplied_units)} Ø§Ø² {formatNumber(request.units)} ÙˆØ§Ø­Ø¯ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡
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
                          Ø¬Ø²Ø¦ÛŒØ§Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª
                        </Button>
                      </Group>
                    </Box>
                  )}
                </Stack>
              </SectionCard>

              <SectionCard title="Ù…Ø³ÛŒØ± Ø§Ù‡Ø¯Ø§" description="Ù‡Ø± Ù…Ø±Ø­Ù„Ù‡ ÛŒÚ© Ø±ÙˆÛŒØ¯Ø§Ø¯ Ù…Ø³ØªÙ‚Ù„ Ø§Ø³ØªØ› Ø±Ù†Ú¯ Ø³Ø¨Ø² ÙÙ‚Ø· ÙˆØ¶Ø¹ÛŒØª Ù…Ø³ÛŒØ± Ø±Ø§ Ù†Ø´Ø§Ù† Ù…ÛŒâ€ŒØ¯Ù‡Ø¯">
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
                      Ø¢Ø®Ø±ÛŒÙ† Ø±ÙˆÛŒØ¯Ø§Ø¯: {formatRelative(selectedDonor.updated_at, state.sim_time)}
                    </Text>
                  </Group>
                  {selectedDonor.status === 'donated' ? (
                    <Badge color="green" variant="light" leftSection={<CheckCircle size={13} />}>
                      Ø§Ù‡Ø¯Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ø«Ø¨Øª Ø´Ø¯
                    </Badge>
                  ) : (
                    <Badge color="orange" variant="light">
                      Ù‡Ù†ÙˆØ² Ø§Ù‡Ø¯Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡
                    </Badge>
                  )}
                </Group>
              </SectionCard>

              <SectionCard
                title="Ø§Ù‚Ø¯Ø§Ù… Ø¨Ø¹Ø¯ÛŒ"
                description="ÙÙ‚Ø· Ú¯Ø°Ø§Ø±Ù‡Ø§ÛŒ Ù…Ø¬Ø§Ø² Ø¯Ø± Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ù†Ù…Ø§ÛŒØ´ Ø¯Ø§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯"
                action={<DonorStatusBadge status={selectedDonor.status} size="md" />}
              >
                <Stack gap="sm">
                  {selectedDonor.status === 'invited' && (
                    <>
                      <Text size="sm" c="dimmed" lh={1.8}>
                        Ø§ÛŒÙ† Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡ Ø¯Ø¹ÙˆØª Ø´Ø¯Ù‡ Ùˆ Ù…Ù†ØªØ¸Ø± Ù¾Ø§Ø³Ø® Ø§Ø³Øª. Ù¾Ø°ÛŒØ±Ø´ Ø¯Ø¹ÙˆØª Ø´Ù…Ø§Ø±Ù†Ø¯Ù‡ confirmed Ø±Ø§ Ø§ÙØ²Ø§ÛŒØ´ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ØŒ
                        Ø§Ù…Ø§ Ù‡ÛŒÚ† ÙˆØ§Ø­Ø¯ÛŒ Ø¨Ù‡ Ù…ÙˆØ¬ÙˆØ¯ÛŒ ÛŒØ§ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡ Ø§Ø¶Ø§ÙÙ‡ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
                      </Text>
                      <Group gap="sm">
                        <Button
                          color="green"
                          leftSection={<Check size={17} />}
                          onClick={() => handleResponse('accepted')}
                        >
                          Ù¾Ø°ÛŒØ±Ø´ Ø¯Ø¹ÙˆØª
                        </Button>
                        <Button
                          variant="default"
                          color="gray"
                          leftSection={<X size={17} />}
                          onClick={() => handleResponse('declined')}
                        >
                          Ø±Ø¯ Ø¯Ø¹ÙˆØª
                        </Button>
                      </Group>
                    </>
                  )}

                  {selectedDonor.status === 'accepted' && (
                    <ProgressButton
                      label="Ø­Ø±Ú©Øª Ø¨Ù‡ Ù…Ø±Ú©Ø²"
                      description="en_route â€” Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡ Ø¯Ø± Ù…Ø³ÛŒØ± Ø§Ø³ØªØ› ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡ ØªØºÛŒÛŒØ± Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯."
                      icon={<Truck size={18} />}
                      color="cyan"
                      onClick={() => handleProgress('en_route')}
                    />
                  )}

                  {selectedDonor.status === 'en_route' && (
                    <ProgressButton
                      label="Ø±Ø³ÛŒØ¯Ù† Ø¨Ù‡ Ù…Ø±Ú©Ø²"
                      description="arrived â€” Ø±Ø³ÛŒØ¯Ù† Ø¨Ù‡ Ù…Ø±Ú©Ø² Ù‡Ù†ÙˆØ² Ø§Ù‡Ø¯Ø§ Ù†ÛŒØ³Øª."
                      icon={<MapPin size={18} />}
                      color="indigo"
                      onClick={() => handleProgress('arrived')}
                    />
                  )}

                  {selectedDonor.status === 'arrived' && (
                    <Group gap="sm" grow>
                      <ProgressButton
                        label="Ù‚Ø¨ÙˆÙ„ÛŒ ØºØ±Ø¨Ø§Ù„Ú¯Ø±ÛŒ"
                        description="screen_pass â€” ØµÙ„Ø§Ø­ÛŒØª Ø§ÙˆÙ„ÛŒÙ‡Ø› ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±."
                        icon={<ShieldCheck size={18} />}
                        color="teal"
                        onClick={() => handleProgress('screen_pass')}
                      />
                      <ProgressButton
                        label="Ø±Ø¯ ØºØ±Ø¨Ø§Ù„Ú¯Ø±ÛŒ"
                        description="screen_fail â€” Ø§Ù‡Ø¯Ø§ Ø§Ù†Ø¬Ø§Ù… Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯."
                        icon={<Prohibit size={18} />}
                        color="red"
                        onClick={() => handleProgress('screen_fail')}
                      />
                    </Group>
                  )}

                  {selectedDonor.status === 'screen_pass' && (
                    <Stack gap="sm">
                      <InlineMessage tone="warning" title="ØªÙ†Ù‡Ø§ Ø§Ù‚Ø¯Ø§Ù… Ù…Ø¤Ø«Ø± Ø¨Ø± ØªØ£Ù…ÛŒÙ†">
                        Ø«Ø¨Øª Â«Ø§Ù‡Ø¯Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒÂ» ØªÙ†Ù‡Ø§ Ø¹Ù…Ù„ÛŒØ§ØªÛŒ Ø§Ø³Øª Ú©Ù‡ ÛŒÚ© ÙˆØ§Ø­Ø¯ Ø¨Ù‡ Ù…Ù‚Ø¯Ø§Ø± ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡ Ø§Ø¶Ø§ÙÙ‡ Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ù¾ÛŒØ´ Ø§Ø²
                        Ø«Ø¨ØªØŒ Ø§Ø² Ø§Ù†Ø¬Ø§Ù… Ø§Ù‡Ø¯Ø§ Ùˆ Ø«Ø¨Øª Ù…Ø¹ØªØ¨Ø± Ø±ÙˆÛŒØ¯Ø§Ø¯ Ù…Ø·Ù…Ø¦Ù† Ø´ÙˆÛŒØ¯.
                      </InlineMessage>
                      <Group gap="sm" grow>
                        <ProgressButton
                          label="Ø«Ø¨Øª Ø§Ù‡Ø¯Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ"
                          description="donated â€” supplied +Û± Ùˆ fulfilled +Û±."
                          icon={<FirstAidKit size={18} />}
                          color="green"
                          onClick={() => handleProgress('donated')}
                        />
                        <ProgressButton
                          label="Ø¹Ø¯Ù… Ù…Ø±Ø§Ø¬Ø¹Ù‡"
                          description="no_show â€” ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡ Ø¨Ø¯ÙˆÙ† ØªØºÛŒÛŒØ±."
                          icon={<X size={18} />}
                          color="gray"
                          onClick={() => handleProgress('no_show')}
                        />
                      </Group>
                    </Stack>
                  )}

                  {['declined', 'screen_fail', 'no_show', 'donated'].includes(selectedDonor.status) && (
                    <InlineMessage tone={selectedDonor.status === 'donated' ? 'success' : 'info'} title="Ù…Ø³ÛŒØ± Ø§ÛŒÙ† Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡ Ø¨Ø³ØªÙ‡ Ø´Ø¯Ù‡ Ø§Ø³Øª">
                      ÙˆØ¶Ø¹ÛŒØª Ù†Ù‡Ø§ÛŒÛŒ: {DONOR_STATUS_LABELS[selectedDonor.status]}. Ø¯Ø± Ø§ÛŒÙ† ÙˆØ¶Ø¹ÛŒØª Ú¯Ø°Ø§Ø± Ø¯ÛŒÚ¯Ø±ÛŒ Ø¯Ø± Ù†Ù…Ø§ÛŒØ´
                      Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª.
                    </InlineMessage>
                  )}
                </Stack>
              </SectionCard>

              {request && (
                <SectionCard title="Ø®Ù„Ø§ØµÙ‡ ØªØ£Ù…ÛŒÙ† Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù…Ø±ØªØ¨Ø·" description="Ù¾Ù†Ø¬ Ú©Ù…ÛŒØª Ø±Ø§ Ø¨Ø§ Ù‡Ù… Ø§Ø´ØªØ¨Ø§Ù‡ Ù†Ú¯ÛŒØ±ÛŒØ¯">
                  <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
                    <MiniStat label="Ø¯Ø±Ø®ÙˆØ§Ø³ØªÛŒ" value={formatUnits(request.units)} />
                    <MiniStat label="ØªØ®ØµÛŒØµâ€ŒÛŒØ§ÙØªÙ‡" value={formatUnits(request.allocated_units)} />
                    <MiniStat label="ÙˆØ§Ù‚Ø¹Ø§Ù‹ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡" value={formatUnits(request.supplied_units)} tone="green" />
                    <MiniStat label="Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡" value={formatUnits(remainingUnits(request))} tone="orange" />
                  </SimpleGrid>
                  <Text size="xs" c="dimmed" mt="sm" lh={1.75}>
                    ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡ ÙÙ‚Ø· Ø§Ø² Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§ÛŒ <span className="bn-mono bn-ltr">donated</span> Ù…ÛŒâ€ŒØ¢ÛŒØ¯. ØªØ®ØµÛŒØµ
                    Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ùˆ Ù¾Ø°ÛŒØ±Ø´ Ø¯Ø¹ÙˆØª Ø¯Ø± Ø§ÛŒÙ† Ø¹Ø¯Ø¯ Ø§Ø«Ø±ÛŒ Ù†Ø¯Ø§Ø±Ù†Ø¯.
                  </Text>
                </SectionCard>
              )}

              <Group gap={6} align="flex-start" c="dimmed">
                <WarningCircle size={17} aria-hidden="true" />
                <Text size="xs" lh={1.7}>
                  Ø§ÛŒÙ† Ù¾ÙˆØ±ØªØ§Ù„ Ù†Ù…Ø§ÛŒØ´ÛŒ Ø§Ø³Øª Ùˆ Ù¾ÛŒØ§Ù… Gateway ÙˆØ§Ù‚Ø¹ÛŒ Ø§Ø±Ø³Ø§Ù„ Ù†Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ Ø³Ø§Ø®ØªÚ¯ÛŒâ€ŒØ§Ù†Ø¯ Ùˆ Ù…Ø¨Ù†Ø§ÛŒ ØªØµÙ…ÛŒÙ…
                  Ù¾Ø²Ø´Ú©ÛŒ Ù†ÛŒØ³ØªÙ†Ø¯.
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

