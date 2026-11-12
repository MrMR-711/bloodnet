import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { ArrowsCounterClockwise, MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { RequestTable } from '../components/RequestTable';
import { SectionCard } from '../components/SectionCard';
import { EmptyState } from '../components/StateViews';
import { useDemoStore } from '../data/DemoStoreContext';
import { formatNumber } from '../lib/format';
import {
  PRODUCT_LABELS,
  STATE_LABELS,
  URGENCY_LABELS,
} from '../lib/labels';
import { PRODUCTS, REQUEST_STATES, URGENCIES } from '../types/domain';

const ALL = 'all';

export function RequestsPage() {
  const { state } = useDemoStore();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState(ALL);
  const [urgencyFilter, setUrgencyFilter] = useState(ALL);
  const [productFilter, setProductFilter] = useState(ALL);

  const normalizedSearch = search.trim().toLocaleLowerCase('fa-IR');

  const filteredRequests = [...state.requests]
    .filter((request) => {
      if (stateFilter !== ALL && request.state !== stateFilter) return false;
      if (urgencyFilter !== ALL && request.urgency !== urgencyFilter) return false;
      if (productFilter !== ALL && request.product !== productFilter) return false;
      if (!normalizedSearch) return true;
      const haystack = [
        request.id,
        request.hospital_name,
        request.blood_group,
        PRODUCT_LABELS[request.product],
        STATE_LABELS[request.state],
        URGENCY_LABELS[request.urgency],
      ]
        .join(' ')
        .toLocaleLowerCase('fa-IR');
      return haystack.includes(normalizedSearch);
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const activeCount = state.requests.filter(
    (request) => !['fulfilled', 'cancelled', 'expired'].includes(request.state),
  ).length;
  const hasFilters =
    Boolean(search.trim()) ||
    stateFilter !== ALL ||
    urgencyFilter !== ALL ||
    productFilter !== ALL;

  const resetFilters = () => {
    setSearch('');
    setStateFilter(ALL);
    setUrgencyFilter(ALL);
    setProductFilter(ALL);
  };

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="چرخه تأمین"
        title="درخواست‌های اهدای خون"
        description="همه درخواست‌ها با وضعیت رسمی، فوریت و مقدار واقعاً تأمین‌شده. فیلترها فقط نمای همین صفحه را تغییر می‌دهند."
        actions={
          <Button
            component={Link}
            to="/requests/new"
            leftSection={<Plus size={17} weight="bold" />}
            color="brand"
          >
            ثبت درخواست جدید
          </Button>
        }
      />

      <Group gap="sm" wrap="wrap">
        <Badge color="brand" variant="light" size="lg">
          {formatNumber(state.requests.length)} درخواست
        </Badge>
        <Badge color="cyan" variant="light" size="lg">
          {formatNumber(activeCount)} فعال
        </Badge>
        <Badge color="gray" variant="light" size="lg">
          {formatNumber(filteredRequests.length)} نتیجه فیلتر
        </Badge>
        {hasFilters && (
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            leftSection={<ArrowsCounterClockwise size={14} />}
            onClick={resetFilters}
          >
            پاک کردن فیلترها
          </Button>
        )}
      </Group>

      <SectionCard noBodyPadding>
        <Box p="md" className="border-b border-[var(--bn-border)]">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
            <TextInput
              label="جست‌وجو"
              placeholder="شناسه، بیمارستان، گروه خونی..."
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              leftSection={<MagnifyingGlass size={16} aria-hidden="true" />}
              aria-label="جست‌وجو در درخواست‌ها"
            />
            <Select
              label="وضعیت رسمی"
              value={stateFilter}
              onChange={(value) => setStateFilter(value ?? ALL)}
              data={[
                { value: ALL, label: 'همه وضعیت‌ها' },
                ...REQUEST_STATES.map((requestState) => ({
                  value: requestState,
                  label: STATE_LABELS[requestState],
                })),
              ]}
              allowDeselect={false}
            />
            <Select
              label="فوریت"
              value={urgencyFilter}
              onChange={(value) => setUrgencyFilter(value ?? ALL)}
              data={[
                { value: ALL, label: 'همه سطوح فوریت' },
                ...URGENCIES.map((urgency) => ({
                  value: urgency,
                  label: URGENCY_LABELS[urgency],
                })),
              ]}
              allowDeselect={false}
            />
            <Select
              label="فرآورده"
              value={productFilter}
              onChange={(value) => setProductFilter(value ?? ALL)}
              data={[
                { value: ALL, label: 'همه فرآورده‌ها' },
                ...PRODUCTS.map((product) => ({
                  value: product,
                  label: PRODUCT_LABELS[product],
                })),
              ]}
              allowDeselect={false}
            />
          </SimpleGrid>
        </Box>

        {filteredRequests.length > 0 ? (
          <Box p="md">
            <RequestTable requests={filteredRequests} now={state.sim_time} />
          </Box>
        ) : (
          <EmptyState
            title="درخواستی با این فیلترها پیدا نشد"
            description="عبارت جست‌وجو یا فیلترهای وضعیت، فوریت و فرآورده را تغییر دهید. داده نمایشی را نیز می‌توانید از منوی کاربر بازنشانی کنید."
            action={
              <Group gap="sm">
                <Button variant="default" onClick={resetFilters}>
                  پاک کردن فیلترها
                </Button>
                <Button component={Link} to="/requests/new" leftSection={<Plus size={16} />}>
                  ثبت درخواست جدید
                </Button>
              </Group>
            }
          />
        )}
      </SectionCard>

      <Text size="xs" c="dimmed" ta="center" lh={1.8}>
        وضعیت رسمی درخواست با وضعیت پردازش رویدادها یکی نیست. «تأمین‌شده» فقط با رویداد
        <span className="bn-mono bn-ltr"> donated </span>
        افزایش می‌یابد.
      </Text>
    </Stack>
  );
}
