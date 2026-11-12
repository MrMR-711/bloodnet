import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  ClockCounterClockwise,
  Database,
  DownloadSimple,
  Drop,
  MagnifyingGlass,
  NotePencil,
  Truck,
  WarningCircle,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import { EmptyState, InlineMessage } from '../components/StateViews';
import { useDemoStore } from '../data/DemoStoreContext';
import { formatDateTime, formatNumber, formatRelative } from '../lib/format';
import {
  ACTOR_ROLE_LABELS,
  AUDIT_TYPE_LABELS,
  auditTypeLabel,
} from '../lib/labels';
import type { ActorRole, AuditEvent } from '../types/domain';

const TYPE_OPTIONS = Object.entries(AUDIT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ACTOR_OPTIONS = Object.entries(ACTOR_ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function AuditPage() {
  const { state } = useDemoStore();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [actorRole, setActorRole] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const requestOptions = state.requests.map((request) => ({
    value: request.id,
    label: `${request.id} — ${request.hospital_name}`,
  }));

  const events = useMemo(
    () =>
      [...state.audit].sort(
        (left, right) => new Date(right.at).getTime() - new Date(left.at).getTime(),
      ),
    [state.audit],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((event) => {
      if (type && event.type !== type) return false;
      if (actorRole && event.actor_role !== (actorRole as ActorRole)) return false;
      if (requestId && event.request_id !== requestId) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        event.id,
        event.type,
        auditTypeLabel(event.type),
        event.actor,
        ACTOR_ROLE_LABELS[event.actor_role],
        event.request_id ?? '',
        event.summary,
        event.effect,
        event.source,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [actorRole, events, query, requestId, type]);

  const hasFilters = Boolean(query || type || actorRole || requestId);
  const requestEventCount = state.audit.filter((event) => event.request_id).length;
  const donorEventCount = state.audit.filter((event) => event.type.startsWith('donor')).length;
  const dispatchEventCount = state.audit.filter((event) => event.type.startsWith('dispatch')).length;

  const resetFilters = () => {
    setQuery('');
    setType(null);
    setActorRole(null);
    setRequestId(null);
  };

  const exportJson = () => {
    const payload = {
      exported_at: state.sim_time,
      exported_at_note: 'Simulation clock, not wall clock',
      count: filtered.length,
      events: filtered,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `bloodnet-audit-${state.sim_time.slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    notifications.show({
      title: 'گزارش Audit آماده شد',
      message: `${formatNumber(filtered.length)} رویداد فیلترشده به‌صورت JSON ذخیره شد.`,
      color: 'teal',
    });
  };

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="شفافیت و ردیابی"
        title="Audit و رویدادها"
        description="هر تغییر قابل مشاهده در حالت نمایشی یک رویداد ثبت می‌کند: چه کسی، چه زمانی، برای کدام درخواست و با چه اثری."
        actions={
          <>
            <Button
              variant="default"
              leftSection={<DownloadSimple size={17} />}
              onClick={exportJson}
              disabled={filtered.length === 0}
            >
              خروجی JSON
            </Button>
            <Button component={Link} to="/guide" variant="light" leftSection={<NotePencil size={17} />}>
              راهنمای قرارداد
            </Button>
          </>
        }
      />

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <StatCard
          label="کل رویدادها"
          value={formatNumber(state.audit.length)}
          hint="شامل داده اولیه و اقدامات این نشست"
          icon={<ClockCounterClockwise size={20} />}
          color="brand"
        />
        <StatCard
          label="رویدادهای درخواست"
          value={formatNumber(requestEventCount)}
          hint="ثبت، تأیید، لغو، اصلاح و تخصیص"
          icon={<Database size={20} />}
          color="cyan"
        />
        <StatCard
          label="رویدادهای اهداکننده"
          value={formatNumber(donorEventCount)}
          hint="دعوت تا اهدای واقعی"
          icon={<Drop size={20} />}
          color="orange"
        />
        <StatCard
          label="رویدادهای تخصیص"
          value={formatNumber(dispatchEventCount)}
          hint="ثبت dispatch و اثر آن"
          icon={<Truck size={20} />}
          color="green"
        />
      </SimpleGrid>

      <SectionCard
        title="جست‌وجو و فیلتر"
        description="فیلترها روی شناسه، نوع، عامل، درخواست، خلاصه و اثر رویداد اعمال می‌شوند."
        action={
          <Button variant="subtle" size="xs" onClick={resetFilters} disabled={!hasFilters}>
            پاک کردن فیلترها
          </Button>
        }
      >
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
          <TextInput
            label="جست‌وجوی متنی"
            placeholder="شناسه، عامل، خلاصه یا اثر..."
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            leftSection={<MagnifyingGlass size={16} />}
          />
          <Select
            label="نوع رویداد"
            placeholder="همه انواع"
            data={TYPE_OPTIONS}
            value={type}
            onChange={setType}
            clearable
            searchable
          />
          <Select
            label="نقش عامل"
            placeholder="همه نقش‌ها"
            data={ACTOR_OPTIONS}
            value={actorRole}
            onChange={setActorRole}
            clearable
          />
          <Select
            label="درخواست"
            placeholder="همه درخواست‌ها"
            data={requestOptions}
            value={requestId}
            onChange={setRequestId}
            clearable
            searchable
          />
        </SimpleGrid>
      </SectionCard>

      <Group justify="space-between" gap="sm" wrap="wrap">
        <Group gap="xs">
          <Badge color="brand" variant="light">
            {formatNumber(filtered.length)} رویداد نمایش داده می‌شود
          </Badge>
          {hasFilters && (
            <Badge color="gray" variant="outline">
              فیلتر فعال
            </Badge>
          )}
        </Group>
        <Text size="xs" c="dimmed">
          منبع نمایشی: localStorage — ساعت شبیه‌سازی {formatDateTime(state.sim_time)}
        </Text>
      </Group>

      {filtered.length === 0 ? (
        <SectionCard noBodyPadding>
          <EmptyState
            title="رویدادی با این فیلترها پیدا نشد"
            description="فیلترها را پاک کنید یا یک اقدام جدید در دمو انجام دهید تا رویداد تازه ثبت شود."
            icon={<MagnifyingGlass size={26} />}
            action={
              <Button variant="default" onClick={resetFilters}>
                پاک کردن فیلترها
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <>
          <SectionCard
            title="جدول رویدادها"
            description="زمان‌ها بر پایه ساعت شبیه‌سازی ۲۰۲۷-۰۱-۱۵ هستند، نه ساعت واقعی سیستم."
            noBodyPadding
          >
            <Box className="bn-scroll-x" visibleFrom="md">
              <Table striped highlightOnHover verticalSpacing="sm" fz="sm">
                <Table.Caption className="bn-sr-only">
                  رویدادهای Audit فیلترشده با زمان، نوع، عامل، درخواست، خلاصه و اثر
                </Table.Caption>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>زمان</Table.Th>
                    <Table.Th>نوع</Table.Th>
                    <Table.Th>عامل</Table.Th>
                    <Table.Th>درخواست</Table.Th>
                    <Table.Th>خلاصه و اثر</Table.Th>
                    <Table.Th>منبع</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((event) => (
                    <Table.Tr key={event.id}>
                      <Table.Td>
                        <Text size="xs" fw={600}>
                          {formatDateTime(event.at)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatRelative(event.at, state.sim_time)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={typeColor(event.type)} variant="light" size="sm">
                          {auditTypeLabel(event.type)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={600}>
                          {event.actor}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {ACTOR_ROLE_LABELS[event.actor_role]}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {event.request_id ? (
                          <Text
                            component={Link}
                            to={`/requests/${event.request_id}`}
                            size="xs"
                            className="bn-mono bn-ltr"
                            c="brand.7"
                            td="underline"
                          >
                            {event.request_id}
                          </Text>
                        ) : (
                          <Text size="xs" c="dimmed">
                            —
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={600} lh={1.7}>
                          {event.summary}
                        </Text>
                        <Text size="xs" c="dimmed" lh={1.7} mt={2}>
                          اثر: {event.effect}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={event.source === 'demo' ? 'gray' : 'teal'} variant="outline" size="xs">
                          {event.source === 'demo' ? 'نمایشی' : 'زنده'}
                        </Badge>
                        <Text size="xs" c="dimmed" className="bn-mono bn-ltr" mt={4}>
                          {event.id}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>

            <Stack gap="sm" hiddenFrom="md" p="md">
              {filtered.map((event) => (
                <AuditCard key={event.id} event={event} now={state.sim_time} />
              ))}
            </Stack>
          </SectionCard>

          <InlineMessage tone="info" title="Audit نمایشی، تصمیم خودکار نیست">
            این صفحه فقط رویدادهای ثبت‌شده در حافظه محلی دمو را نشان می‌دهد. در نسخه واقعی، Audit باید در
            تراکنش همان عملیات نوشته شود و شامل شناسه یکتای رویداد، منبع و اثر باشد. هیچ رویدادی در این صفحه
            وضعیت درخواست یا موجودی را تغییر نمی‌دهد.
          </InlineMessage>

          <Group gap={6} align="flex-start" c="dimmed">
            <WarningCircle size={17} aria-hidden="true" />
            <Text size="xs" lh={1.7}>
              داده‌ها ساختگی و برای نمایش جریان کار هستند. خروجی JSON را می‌توانید برای بررسی محلی ذخیره
              کنید؛ این خروجی شامل توکن یا اطلاعات حساس نیست.
            </Text>
          </Group>
        </>
      )}
    </Stack>
  );
}

function AuditCard({ event, now }: { event: AuditEvent; now: string }) {
  return (
    <Box className="rounded-xl border border-[var(--bn-border)] bg-white p-3">
      <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
        <Badge color={typeColor(event.type)} variant="light" size="sm">
          {auditTypeLabel(event.type)}
        </Badge>
        <Text size="xs" c="dimmed">
          {formatDateTime(event.at)} · {formatRelative(event.at, now)}
        </Text>
      </Group>
      <Text size="sm" fw={700} mt={8} lh={1.7}>
        {event.summary}
      </Text>
      <Text size="xs" c="dimmed" mt={4} lh={1.7}>
        اثر: {event.effect}
      </Text>
      <Group justify="space-between" gap="xs" mt="sm" wrap="wrap">
        <Text size="xs" c="dimmed">
          {event.actor} · {ACTOR_ROLE_LABELS[event.actor_role]}
        </Text>
        {event.request_id && (
          <Text
            component={Link}
            to={`/requests/${event.request_id}`}
            size="xs"
            c="brand.7"
            className="bn-mono bn-ltr"
            td="underline"
          >
            {event.request_id}
          </Text>
        )}
      </Group>
      <Group justify="space-between" gap="xs" mt={6}>
        <Text size="xs" c="dimmed" className="bn-mono bn-ltr">
          {event.id}
        </Text>
        <Badge color={event.source === 'demo' ? 'gray' : 'teal'} variant="outline" size="xs">
          {event.source === 'demo' ? 'نمایشی' : 'زنده'}
        </Badge>
      </Group>
    </Box>
  );
}

function typeColor(type: string): string {
  if (type.startsWith('request')) return 'brand';
  if (type.startsWith('donor')) return 'orange';
  if (type.startsWith('dispatch')) return 'green';
  if (type.startsWith('gateway')) return 'cyan';
  return 'gray';
}
