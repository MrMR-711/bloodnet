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
              ÙÙ‡Ø±Ø³Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ÛŒ Ø§Ù‡Ø¯Ø§ÛŒ Ø®ÙˆÙ† Ø¨Ø§ ÙˆØ¶Ø¹ÛŒØªØŒ ÙØ±Ø¢ÙˆØ±Ø¯Ù‡ Ùˆ Ù…Ù‚Ø¯Ø§Ø± ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡
            </Table.Caption>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Ø¯Ø±Ø®ÙˆØ§Ø³Øª</Table.Th>
                <Table.Th>ÙØ±Ø¢ÙˆØ±Ø¯Ù‡</Table.Th>
                <Table.Th>Ú¯Ø±ÙˆÙ‡</Table.Th>
                <Table.Th>ØªØ£Ù…ÛŒÙ† / Ø¯Ø±Ø®ÙˆØ§Ø³Øª</Table.Th>
                <Table.Th>ÙˆØ¶Ø¹ÛŒØª</Table.Th>
                <Table.Th>ÙÙˆØ±ÛŒØª</Table.Th>
                <Table.Th>Ø¢Ø®Ø±ÛŒÙ† Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ</Table.Th>
                <Table.Th aria-label="Ø¹Ù…Ù„ÛŒØ§Øª" />
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
                        <MapPin size={12} color="#6b4a4f" aria-hidden="true" />
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
                        Ø§Ø² {formatNumber(request.units)}
                      </Text>
                      <Progress
                        value={clampPercent(request.supplied_units, request.units)}
                        size={5}
                        radius="xl"
                        color={request.supplied_units >= request.units ? 'green' : 'brand'}
                        className="w-14"
                        aria-label={`Ù¾ÛŒØ´Ø±ÙØª ØªØ£Ù…ÛŒÙ† ${request.supplied_units} Ø§Ø² ${request.units}`}
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
                      aria-label={`Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øª ${request.id}`}
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
          <Link key={request.id} to={`/requests/${request.id}`} aria-label={`Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øª ${request.id}`}>
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
                    ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡
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

