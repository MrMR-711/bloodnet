import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Paper,
  Progress,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { CaretLeft, Drop, MapPin } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import type { RequestRecord } from '../types/domain';
import { ProductBadge, StateBadge, UrgencyBadge, BloodGroupBadge } from './Badges';
import { clampPercent, formatNumber, formatRelative } from '../lib/format';

interface RequestTableProps {
  requests: RequestRecord[];
  now: string;
}

export function RequestTable({ requests, now }: RequestTableProps) {
  return (
    <>
      <Box visibleFrom="md">
        <Table.ScrollContainer minWidth={860}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Caption className="bn-sr-only">
              فهرست درخواست‌های اهدای خون با وضعیت، فرآورده و مقدار تأمین‌شده
            </Table.Caption>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>درخواست</Table.Th>
                <Table.Th>فرآورده</Table.Th>
                <Table.Th>گروه</Table.Th>
                <Table.Th>تأمین / درخواست</Table.Th>
                <Table.Th>وضعیت</Table.Th>
                <Table.Th>فوریت</Table.Th>
                <Table.Th>آخرین به‌روزرسانی</Table.Th>
                <Table.Th aria-label="عملیات" />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {requests.map((request) => (
                <Table.Tr key={request.id}>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text
                        component={Link}
                        to={`/requests/${request.id}`}
                        size="xs"
                        fw={700}
                        c="brand.8"
                        className="bn-mono"
                        dir="ltr"
                      >
                        {request.id}
                      </Text>
                      <Group gap={4} wrap="nowrap">
                        <MapPin size={12} color="#6B8587" aria-hidden="true" />
                        <Text size="xs" c="dimmed" truncate maw={190}>
                          {request.hospital_name}
                        </Text>
                      </Group>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <ProductBadge product={request.product} />
                  </Table.Td>
                  <Table.Td>
                    <BloodGroupBadge group={request.blood_group} />
                  </Table.Td>
                  <Table.Td>
                    <Group gap={8} wrap="nowrap">
                      <Text size="sm" fw={700} className="bn-number">
                        {formatNumber(request.supplied_units)}
                      </Text>
                      <Text size="xs" c="dimmed">
                        از {formatNumber(request.units)}
                      </Text>
                      <Progress
                        value={clampPercent(request.supplied_units, request.units)}
                        size={5}
                        radius="xl"
                        color={request.supplied_units >= request.units ? 'green' : 'brand'}
                        className="w-14"
                        aria-label={`پیشرفت تأمین ${request.supplied_units} از ${request.units}`}
                      />
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <StateBadge state={request.state} />
                  </Table.Td>
                  <Table.Td>
                    <UrgencyBadge urgency={request.urgency} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed" className="whitespace-nowrap">
                      {formatRelative(request.updated_at, now)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      component={Link}
                      to={`/requests/${request.id}`}
                      variant="light"
                      color="brand"
                      size="md"
                      radius="md"
                      aria-label={`مشاهده درخواست ${request.id}`}
                    >
                      <CaretLeft size={17} weight="bold" />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Box>

      <Stack gap="sm" hiddenFrom="md">
        {requests.map((request) => (
          <Link key={request.id} to={`/requests/${request.id}`} aria-label={`مشاهده درخواست ${request.id}`}>
            <Paper className="bn-card" p="md" radius="lg">
              <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
                <Box className="min-w-0">
                  <Text size="xs" fw={700} c="brand.8" className="bn-mono" dir="ltr">
                    {request.id}
                  </Text>
                  <Text size="sm" fw={700} mt={2} truncate>
                    {request.hospital_name}
                  </Text>
                  <Group gap={6} mt={6} wrap="wrap">
                    <ProductBadge product={request.product} size="xs" />
                    <BloodGroupBadge group={request.blood_group} size="xs" />
                    <UrgencyBadge urgency={request.urgency} size="xs" />
                  </Group>
                </Box>
                <StateBadge state={request.state} />
              </Group>

              <Group justify="space-between" mt="sm" gap="sm">
                <Group gap={6}>
                  <Drop size={14} color="#C2413A" weight="fill" aria-hidden="true" />
                  <Text size="xs" c="dimmed">
                    تأمین‌شده
                  </Text>
                  <Text size="sm" fw={700} className="bn-number">
                    {formatNumber(request.supplied_units)} / {formatNumber(request.units)}
                  </Text>
                </Group>
                <Badge color="gray" variant="light" size="xs">
                  {formatRelative(request.updated_at, now)}
                </Badge>
              </Group>
              <Progress
                value={clampPercent(request.supplied_units, request.units)}
                size={5}
                radius="xl"
                mt={8}
                color={request.supplied_units >= request.units ? 'green' : 'brand'}
              />
            </Paper>
          </Link>
        ))}
      </Stack>
    </>
  );
}
