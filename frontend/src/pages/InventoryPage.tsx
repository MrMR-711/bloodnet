import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  ArrowsCounterClockwise,
  Buildings,
  CheckCircle,
  Clock,
  Drop,
  FirstAidKit,
  MagnifyingGlass,
  Truck,
  UsersThree,
  WarningCircle,
} from '@phosphor-icons/react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import { BloodGroupBadge, ProductBadge } from '../components/Badges';
import { EmptyState, InlineMessage } from '../components/StateViews';
import {
  compatibleInventoryFor,
  inventoryExpiresAt,
  remainingUnits,
  useDemoStore,
} from '../data/DemoStoreContext';
import {
  expiryLabel,
  expiryTone,
  formatDuration,
  formatNumber,
  formatUnits,
  isoFromSimMinute,
  minutesBetween,
} from '../lib/format';
import { PRODUCT_LABELS } from '../lib/labels';
import { BLOOD_GROUPS, PRODUCTS, isCompatible } from '../types/domain';
import type { InventoryItem, RequestRecord } from '../types/domain';
import { createId } from '../lib/ids';

const ALL = 'all';

export function InventoryPage() {
  const { state, dispatchInventory, hospitals, centers } = useDemoStore();
  const [searchParams] = useSearchParams();
  const requestParam = searchParams.get('request');

  const [search, setSearch] = useState('');
  const [centerFilter, setCenterFilter] = useState(ALL);
  const [productFilter, setProductFilter] = useState(ALL);
  const [groupFilter, setGroupFilter] = useState(ALL);

  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(requestParam ?? '');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [units, setUnits] = useState(1);

  const dispatchableRequests = state.requests.filter(
    (request) => !['pending_review', 'fulfilled', 'cancelled', 'expired'].includes(request.state),
  );
  const selectedRequest = state.requests.find((request) => request.id === selectedRequestId) ?? null;
  const compatibleItems = selectedRequest ? compatibleInventoryFor(state, selectedRequest) : [];
  const selectedItem = compatibleItems.find((item) => item.id === selectedItemId) ?? null;
  const selectedHospital = selectedRequest ? hospitals.find((hospital) => hospital.id === selectedRequest.hospital_id) : null;
  const travelMinutes = selectedHospital && selectedItem ? selectedHospital.travel_min[selectedItem.center_id] ?? 30 : 30;
  const etaMinutes = 10 + travelMinutes;

  const normalizedSearch = search.trim().toLocaleLowerCase('fa-IR');
  const filteredInventory = state.inventory
    .filter((item) => {
      if (centerFilter !== ALL && item.center_id !== centerFilter) return false;
      if (productFilter !== ALL && item.product !== productFilter) return false;
      if (groupFilter !== ALL && item.blood_group !== groupFilter) return false;
      if (!normalizedSearch) return true;
      return [item.id, item.center_name, item.blood_group, PRODUCT_LABELS[item.product]]
        .join(' ')
        .toLocaleLowerCase('fa-IR')
        .includes(normalizedSearch);
    })
    .sort((a, b) => a.expires_sim_min - b.expires_sim_min);

  const totalUnits = state.inventory.reduce((sum, item) => sum + item.units, 0);
  const criticalItems = state.inventory.filter(
    (item) => expiryTone(isoFromSimMinute(item.expires_sim_min), state.sim_time) === 'critical',
  );
  const expiredItems = state.inventory.filter(
    (item) => expiryTone(isoFromSimMinute(item.expires_sim_min), state.sim_time) === 'expired',
  );

  const resetFilters = () => {
    setSearch('');
    setCenterFilter(ALL);
    setProductFilter(ALL);
    setGroupFilter(ALL);
  };

  const openDispatch = (item: InventoryItem) => {
    const preferred = requestParam
      ? state.requests.find((request) => request.id === requestParam)
      : undefined;
    const itemIsUsable = (request: RequestRecord) =>
      dispatchableRequests.includes(request) &&
      request.product === item.product &&
      isCompatible(item.blood_group, request.blood_group, request.product) &&
      minutesBetween(state.sim_time, inventoryExpiresAt(item)) > 0;

    const targetRequest =
      preferred && itemIsUsable(preferred)
        ? preferred
        : dispatchableRequests.find((request) => itemIsUsable(request));

    setSelectedRequestId(targetRequest?.id ?? '');
    setSelectedItemId(item.id);
    setUnits(1);
    setDispatchOpen(true);
  };

  const handleDispatch = async () => {
    if (!selectedRequest) {
      notifications.show({ title: 'درخواست انتخاب نشده', message: 'یک درخواست فعال انتخاب کنید.', color: 'orange' });
      return;
    }
    if (!selectedItem) {
      notifications.show({ title: 'موجودی انتخاب نشده', message: 'یک ردیف موجودی سازگار انتخاب کنید.', color: 'orange' });
      return;
    }
    try {
      const dispatch = await dispatchInventory({
        item_id: selectedItem.id,
        request_id: selectedRequest.id,
        units,
        dispatch_id: createId('DSP'),
      });
      notifications.show({
        title: 'موجودی تخصیص یافت',
        message: `${formatNumber(dispatch.units)} واحد از ${dispatch.center_name} تخصیص یافت؛ مقدار تأمین‌شده تغییر نکرد.`,
        color: 'green',
        icon: <CheckCircle size={18} weight="fill" />,
      });
      setDispatchOpen(false);
    } catch (error) {
      notifications.show({
        title: 'تخصیص انجام نشد',
        message: error instanceof Error ? error.message : 'خطای نامشخص در تخصیص موجودی رخ داد.',
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="شبکه تأمین"
        title="موجودی مراکز و تخصیص FEFO"
        description="موجودی هر مرکز با گروه خونی، فرآورده و زمان انقضا. تخصیص با نزدیک‌ترین انقضا و ماتریس سازگاری رسمی انجام می‌شود."
        actions={
          <>
            <Button component={Link} to="/donor" variant="default" leftSection={<UsersThree size={17} />}>
              پورتال اهداکننده
            </Button>
            <Button component={Link} to="/requests" leftSection={<Drop size={17} weight="fill" />}>
              درخواست‌ها
            </Button>
          </>
        }
      />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
        <StatCard
          label="موجودی کل"
          value={formatUnits(totalUnits)}
          hint={`${formatNumber(state.inventory.length)} ردیف در ${formatNumber(centers.length)} مرکز`}
          icon={<Drop size={21} weight="duotone" />}
          color="brand"
        />
        <StatCard
          label="نزدیک انقضا"
          value={formatNumber(criticalItems.length)}
          hint="کمتر از ۶ ساعت تا انقضا"
          icon={<Clock size={21} weight="duotone" />}
          color="orange"
        />
        <StatCard
          label="منقضی‌شده"
          value={formatNumber(expiredItems.length)}
          hint="غیرقابل تخصیص در این نمایش"
          icon={<WarningCircle size={21} weight="duotone" />}
          color="crimson"
        />
        <StatCard
          label="درخواست‌های قابل تخصیص"
          value={formatNumber(dispatchableRequests.length)}
          hint="open / mobilizing / partially_fulfilled"
          icon={<FirstAidKit size={21} weight="duotone" />}
          color="green"
        />
      </SimpleGrid>

      <SectionCard noBodyPadding>
        <Box p="md" className="border-b border-[var(--bn-border)]">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
            <TextInput
              label="جست‌وجو"
              placeholder="شناسه ردیف، مرکز، گروه..."
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              leftSection={<MagnifyingGlass size={16} aria-hidden="true" />}
              aria-label="جست‌وجو در موجودی"
            />
            <Select
              label="مرکز"
              value={centerFilter}
              onChange={(value) => setCenterFilter(value ?? ALL)}
              data={[
                { value: ALL, label: 'همه مراکز' },
                ...centers.map((center) => ({ value: center.id, label: center.name })),
              ]}
              allowDeselect={false}
            />
            <Select
              label="فرآورده"
              value={productFilter}
              onChange={(value) => setProductFilter(value ?? ALL)}
              data={[
                { value: ALL, label: 'همه فرآورده‌ها' },
                ...PRODUCTS.map((product) => ({ value: product, label: PRODUCT_LABELS[product] })),
              ]}
              allowDeselect={false}
            />
            <Select
              label="گروه خونی"
              value={groupFilter}
              onChange={(value) => setGroupFilter(value ?? ALL)}
              data={[
                { value: ALL, label: 'همه گروه‌ها' },
                ...BLOOD_GROUPS.map((group) => ({ value: group, label: group })),
              ]}
              allowDeselect={false}
            />
          </SimpleGrid>
          <Group justify="space-between" mt="sm" gap="sm">
            <Text size="xs" c="dimmed">
              {formatNumber(filteredInventory.length)} ردیف نمایش داده می‌شود.
            </Text>
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              leftSection={<ArrowsCounterClockwise size={14} />}
              onClick={resetFilters}
            >
              پاک کردن فیلترها
            </Button>
          </Group>
        </Box>

        {filteredInventory.length > 0 ? (
          <>
            <Box visibleFrom="md" p="md">
              <Table.ScrollContainer minWidth={900}>
                <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
                  <Table.Caption className="bn-sr-only">
                    موجودی مراکز با ترتیب FEFO و امکان تخصیص
                  </Table.Caption>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>FEFO</Table.Th>
                      <Table.Th>ردیف</Table.Th>
                      <Table.Th>مرکز</Table.Th>
                      <Table.Th>فرآورده</Table.Th>
                      <Table.Th>گروه</Table.Th>
                      <Table.Th>موجودی</Table.Th>
                      <Table.Th>انقضا</Table.Th>
                      <Table.Th aria-label="عملیات" />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredInventory.map((item, index) => {
                      const tone = expiryTone(isoFromSimMinute(item.expires_sim_min), state.sim_time);
                      return (
                        <Table.Tr key={item.id}>
                          <Table.Td>
                            <Badge color="brand" variant="light" size="sm" className="bn-number">
                              {formatNumber(index + 1)}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" className="bn-mono" dir="ltr">
                              {item.id}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{item.center_name}</Text>
                          </Table.Td>
                          <Table.Td>
                            <ProductBadge product={item.product} size="xs" />
                          </Table.Td>
                          <Table.Td>
                            <BloodGroupBadge group={item.blood_group} size="xs" />
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={700} className="bn-number">
                              {formatNumber(item.units)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={tone === 'expired' ? 'red' : tone === 'critical' ? 'orange' : tone === 'warning' ? 'yellow' : 'green'}
                              variant="light"
                              size="xs"
                            >
                              {expiryLabel(isoFromSimMinute(item.expires_sim_min), state.sim_time)}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Button
                              size="xs"
                              variant="light"
                              leftSection={<Truck size={14} />}
                              onClick={() => openDispatch(item)}
                              disabled={tone === 'expired' || dispatchableRequests.length === 0}
                            >
                              تخصیص
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Box>

            <Stack gap="sm" hiddenFrom="md" p="md">
              {filteredInventory.map((item, index) => {
                const tone = expiryTone(isoFromSimMinute(item.expires_sim_min), state.sim_time);
                return (
                  <Box key={item.id} p="md" className="rounded-xl border border-[var(--bn-border)] bg-white">
                    <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
                      <Box className="min-w-0">
                        <Group gap={6} wrap="nowrap">
                          <Badge color="brand" variant="light" size="xs">
                            FEFO {formatNumber(index + 1)}
                          </Badge>
                          <Text size="xs" className="bn-mono" dir="ltr">
                            {item.id}
                          </Text>
                        </Group>
                        <Text size="sm" fw={700} mt={5}>
                          {item.center_name}
                        </Text>
                        <Group gap={6} mt={5}>
                          <ProductBadge product={item.product} size="xs" />
                          <BloodGroupBadge group={item.blood_group} size="xs" />
                        </Group>
                      </Box>
                      <Text size="sm" fw={800} className="bn-number">
                        {formatNumber(item.units)} واحد
                      </Text>
                    </Group>
                    <Group justify="space-between" mt="sm" gap="sm">
                      <Badge
                        color={tone === 'expired' ? 'red' : tone === 'critical' ? 'orange' : tone === 'warning' ? 'yellow' : 'green'}
                        variant="light"
                        size="xs"
                      >
                        {expiryLabel(isoFromSimMinute(item.expires_sim_min), state.sim_time)}
                      </Badge>
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<Truck size={14} />}
                        onClick={() => openDispatch(item)}
                        disabled={tone === 'expired' || dispatchableRequests.length === 0}
                      >
                        تخصیص
                      </Button>
                    </Group>
                  </Box>
                );
              })}
            </Stack>
          </>
        ) : (
          <EmptyState
            title="ردیفی با این فیلترها پیدا نشد"
            description="فیلترها را تغییر دهید یا داده نمایشی را از منوی کاربر بازنشانی کنید."
            icon={<Buildings size={24} />}
            action={
              <Button variant="default" onClick={resetFilters}>
                پاک کردن فیلترها
              </Button>
            }
          />
        )}
      </SectionCard>

      <InlineMessage tone="info" title="FEFO و تخصیص اتمی">
        ردیف‌ها با نزدیک‌ترین زمان انقضا مرتب شده‌اند. در قرارداد واقعی، موجودی در یک تراکنش کسر می‌شود؛
        تخصیص ناموفق نباید موجودی را کم کند. تخصیص موجودی، مقدار «واقعاً تأمین‌شده» را افزایش نمی‌دهد.
      </InlineMessage>

      <Modal
        opened={dispatchOpen}
        onClose={() => setDispatchOpen(false)}
        title="تخصیص موجودی با FEFO"
        size="lg"
        centered
      >
        <Stack gap="md">
          <Select
            label="درخواست فعال"
            placeholder={dispatchableRequests.length > 0 ? 'درخواست را انتخاب کنید' : 'درخواست قابل تخصیص وجود ندارد'}
            data={dispatchableRequests.map((request) => ({
              value: request.id,
              label: `${request.id} — ${request.hospital_name} — ${PRODUCT_LABELS[request.product]} ${request.blood_group} (${formatNumber(remainingUnits(request))} باقی‌مانده)`,
            }))}
            value={selectedRequestId || null}
            onChange={(value) => {
              setSelectedRequestId(value ?? '');
              setSelectedItemId('');
            }}
            searchable
            allowDeselect={false}
            nothingFoundMessage="درخواست فعالی یافت نشد"
          />

          <Select
            label="ردیف موجودی سازگار (مرتب‌شده با FEFO)"
            placeholder={selectedRequest ? 'ردیف را انتخاب کنید' : 'اول درخواست را انتخاب کنید'}
            data={compatibleItems.map((item) => ({
              value: item.id,
              label: `${item.id} — ${item.center_name} — ${item.blood_group} — ${formatNumber(item.units)} واحد — ${expiryLabel(isoFromSimMinute(item.expires_sim_min), state.sim_time)}`,
            }))}
            value={selectedItemId || null}
            onChange={(value) => {
              setSelectedItemId(value ?? '');
              setUnits(1);
            }}
            searchable
            allowDeselect={false}
            disabled={!selectedRequest}
            nothingFoundMessage="موجودی سازگاری برای این درخواست وجود ندارد"
          />

          <NumberInput
            label="تعداد واحد برای تخصیص"
            description={selectedItem ? `حداکثر ${formatNumber(selectedItem.units)} واحد در این ردیف` : 'ابتدا ردیف موجودی را انتخاب کنید'}
            min={1}
            max={selectedItem?.units ?? 1}
            value={units}
            onChange={(value) => setUnits(typeof value === 'number' ? value : 1)}
            clampBehavior="strict"
          />

          <Box className="rounded-xl border border-[#D8EAE6] bg-[#F7FBFA] p-4">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <SummaryLine label="درخواست" value={selectedRequest?.id ?? '—'} mono />
              <SummaryLine label="بیمارستان" value={selectedRequest?.hospital_name ?? '—'} />
              <SummaryLine label="فرآورده" value={selectedRequest ? PRODUCT_LABELS[selectedRequest.product] : '—'} />
              <SummaryLine label="گروه گیرنده" value={selectedRequest?.blood_group ?? '—'} mono />
              <SummaryLine label="مرکز" value={selectedItem?.center_name ?? '—'} />
              <SummaryLine label="ETA شبیه‌سازی" value={formatDuration(etaMinutes)} />
              <SummaryLine
                label="تأمین‌شده فعلی"
                value={selectedRequest ? `${formatNumber(selectedRequest.supplied_units)} از ${formatNumber(selectedRequest.units)}` : '—'}
              />
              <SummaryLine label="انقضا" value={selectedItem ? expiryLabel(isoFromSimMinute(selectedItem.expires_sim_min), state.sim_time) : '—'} />
            </SimpleGrid>
          </Box>

          {!selectedRequest && (
            <InlineMessage tone="warning" title="درخواست انتخاب نشده">
              فقط درخواست‌های open، mobilizing و partially_fulfilled قابل تخصیص‌اند. درخواست pending_review باید اول
              تأیید شود.
            </InlineMessage>
          )}
          {selectedRequest && compatibleItems.length === 0 && (
            <InlineMessage tone="warning" title="موجودی سازگار کافی نیست">
              برای این فرآورده و گروه خونی، ردیف معتبر و منقضی‌نشده‌ای وجود ندارد. تخصیص ناموفق موجودی را کم نمی‌کند.
            </InlineMessage>
          )}
          {selectedItem && selectedRequest && (
            <InlineMessage tone="info" title="این عملیات اهدا نیست">
              تخصیص موجودی، مقدار «مقدار تخصیص‌یافته» را افزایش می‌دهد و موجودی مرکز را کم می‌کند؛ اما «مقدار
              واقعاً تأمین‌شده» فقط با رویداد <span className="bn-mono bn-ltr">donated</span> تغییر می‌کند.
            </InlineMessage>
          )}

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setDispatchOpen(false)}>
              انصراف
            </Button>
            <Button
              color="brand"
              leftSection={<Truck size={17} />}
              onClick={handleDispatch}
              disabled={!selectedRequest || !selectedItem}
            >
              ثبت تخصیص
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function SummaryLine({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <Group justify="space-between" gap="xs" wrap="nowrap">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" fw={600} className={mono ? 'bn-mono' : undefined} dir={mono ? 'ltr' : undefined} ta="end">
        {value}
      </Text>
    </Group>
  );
}
