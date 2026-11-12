import {
  Badge,
  Box,
  Code,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import {
  BookOpen,
  CheckCircle,
  Code as CodeIcon,
  Database,
  Gear,
  Info,
  ShieldCheck,
  WarningCircle,
} from '@phosphor-icons/react';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';
import { InlineMessage } from '../components/StateViews';

const FRONTEND_STACK = [
  ['React / React DOM', '19.3.1', 'Ú©ØªØ§Ø¨Ø®Ø§Ù†Ù‡ Ø±Ø§Ø¨Ø· Ú©Ø§Ø±Ø¨Ø±ÛŒ'],
  ['TypeScript', '5.9.3', 'ØªØ§ÛŒÙ¾ Ø§Ø³ØªØ§ØªÛŒÚ© Ø³Ø®Øªâ€ŒÚ¯ÛŒØ±Ø§Ù†Ù‡'],
  ['Vite', '8.3.8', 'Ø§Ø¨Ø²Ø§Ø± ØªÙˆØ³Ø¹Ù‡ Ùˆ build'],
  ['Tailwind CSS', '4.3.5', 'Ù„Ø§ÛŒÙ‡ utility Ùˆ ØªÙˆÚ©Ù†â€ŒÙ‡Ø§'],
  ['Mantine', '9.8.0', 'Ú©Ø§Ù…Ù¾ÙˆÙ†Ù†Øªâ€ŒÙ‡Ø§ÛŒ Ø¯Ø³ØªØ±Ø³â€ŒÙ¾Ø°ÛŒØ± Ùˆ RTL'],
  ['React Router DOM', '7.18.5', 'Ù…Ø³ÛŒØ±Ø¨Ù†Ø¯ÛŒ Ø³Ù…Øª Ú©Ù„Ø§ÛŒÙ†Øª'],
  ['Phosphor Icons', '2.1.10', 'Ø¢ÛŒÚ©ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¨Ø±Ø¯Ø§Ø±ÛŒ'],
  ['Vazirmatn Variable', '5.3.0', 'ÙÙˆÙ†Øª ÙØ§Ø±Ø³ÛŒ'],
];

const BACKEND_STACK = [
  ['Python', '3.14.7', 'Ø²Ø¨Ø§Ù† Ø§Ø¬Ø±Ø§'],
  ['FastAPI', '0.162.5', 'HTTP API Ùˆ OpenAPI'],
  ['Uvicorn', '0.54.0', 'Ø³Ø±ÙˆØ± ASGI'],
  ['SQLAlchemy', '2.1.8', 'ORM Ù‡Ù…Ú¯Ø§Ù…'],
  ['SQLite', 'WAL + foreign_keys', 'Ù¾Ø§ÛŒÚ¯Ø§Ù‡â€ŒØ¯Ø§Ø¯Ù‡ Ù…Ø­Ù„ÛŒ Ø¯Ù…Ùˆ'],
  ['Alembic', '1.20.1', 'Ù…Ù‡Ø§Ø¬Ø±Øª Ø§Ø³Ú©ÛŒÙ…Ø§'],
  ['Pydantic', '2.14.3', 'Ø§Ø¹ØªØ¨Ø§Ø±Ø³Ù†Ø¬ÛŒ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯'],
  ['httpx', '0.28.1', 'Ú©Ù„Ø§ÛŒÙ†Øª Ø³Ø±ÙˆÛŒØ³â€ŒÙ‡Ø§ÛŒ Mock'],
  ['pytest', '9.2.0', 'Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ùˆ Ø¯Ø§Ù…Ù†Ù‡'],
];

const CONTRACT_ROWS = [
  ['POST /requests', 'hospitalBearer + Idempotency-Key', 'Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³ØªØ› 201Ø› ØªÚ©Ø±Ø§Ø± Ù‡Ù…Ø§Ù† Ú©Ù„ÛŒØ¯ Ùˆ Ø¨Ø¯Ù†Ù‡ 200'],
  ['GET /requests/{id}', 'hospitalBearer', 'Ø®ÙˆØ§Ù†Ø¯Ù† Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ùˆ Ø´Ù…Ø§Ø±Ù†Ø¯Ù‡â€ŒÙ‡Ø§'],
  ['POST /requests/{id}/cancel', 'hospitalBearer', 'Ù„ØºÙˆØ› ØªÚ©Ø±Ø§Ø± 200 Ø¨Ø¯ÙˆÙ† Ø§Ø«Ø±'],
  ['POST /requests/{id}/approve', 'coordinatorBearer', 'ÙÙ‚Ø· pending_reviewØ› ÙˆÚ¯Ø±Ù†Ù‡ 409'],
  ['POST /requests/{id}/amend', 'hospitalBearer', 'ÙÙ‚Ø· ØªØºÛŒÛŒØ± urgencyØ› ÙˆÚ¯Ø±Ù†Ù‡ 409'],
  ['POST /callbacks/donor-response', 'Ø¨Ø¯ÙˆÙ† Ø§Ø­Ø±Ø§Ø² Ù‡ÙˆÛŒØª', 'accepted / declinedØ› dedupe Ø¨Ø§ event_id'],
  ['POST /callbacks/donor-progress', 'Ø¨Ø¯ÙˆÙ† Ø§Ø­Ø±Ø§Ø² Ù‡ÙˆÛŒØª', 'en_route / arrived / screen_pass / screen_fail / donated / no_show'],
  ['POST /callbacks/gateway-status', 'Ø¨Ø¯ÙˆÙ† Ø§Ø­Ø±Ø§Ø² Ù‡ÙˆÛŒØª', 'queued / sent / delivered / failed / expired'],
  ['GET /inventory', 'endpoint Ø³Ø±ÙˆÛŒØ³ Ù…ÙˆØ¬ÙˆØ¯ÛŒ', 'Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ø²Ù†Ø¯Ù‡ Ùˆ expiry'],
  ['POST /inventory/dispatch', 'endpoint Ø³Ø±ÙˆÛŒØ³ Ù…ÙˆØ¬ÙˆØ¯ÛŒ', 'ØªØ®ØµÛŒØµ Ø§ØªÙ…ÛŒ FEFOØ› 201/200/400/404/409/422'],
];

const FIVE_QUANTITIES = [
  ['Ù…Ù‚Ø¯Ø§Ø± Ø¯Ø±Ø®ÙˆØ§Ø³ØªÛŒ', 'units', 'ØªØ¹Ø¯Ø§Ø¯ ÙˆØ§Ø­Ø¯ Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡ Ø¯Ø± Ø¯Ø±Ø®ÙˆØ§Ø³Øª (1 ØªØ§ 20)'],
  ['Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ø³Ø§Ø²Ú¯Ø§Ø± Ù‚Ø§Ø¨Ù„ ØªØ®ØµÛŒØµ', 'compatible allocatable', 'Ù…ÙˆØ¬ÙˆØ¯ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ù…Ø±Ø§Ú©Ø² Ø¨Ø§ Ø³Ø§Ø²Ú¯Ø§Ø±ÛŒ Ùˆ expiry Ù…Ø¹ØªØ¨Ø±'],
  ['Ù…Ù‚Ø¯Ø§Ø± ØªØ®ØµÛŒØµâ€ŒÛŒØ§ÙØªÙ‡', 'allocated', 'ÙˆØ§Ø­Ø¯Ù‡Ø§ÛŒÛŒ Ú©Ù‡ dispatch Ø´Ø¯Ù‡â€ŒØ§Ù†Ø¯Ø› Ù‡Ù†ÙˆØ² Ø§Ù‡Ø¯Ø§ Ù†ÛŒØ³ØªÙ†Ø¯'],
  ['Ù…Ù‚Ø¯Ø§Ø± ÙˆØ§Ù‚Ø¹Ø§Ù‹ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡', 'supplied', 'ÙÙ‚Ø· Ø¨Ø§ Ø±ÙˆÛŒØ¯Ø§Ø¯ donated Ø§ÙØ²Ø§ÛŒØ´ Ù…ÛŒâ€ŒÛŒØ§Ø¨Ø¯'],
  ['Ù…Ù‚Ø¯Ø§Ø± Ø¨Ø§Ù‚ÛŒâ€ŒÙ…Ø§Ù†Ø¯Ù‡', 'remaining', 'ØªÙØ§ÙˆØª Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨Ø§ Ù…Ù‚Ø¯Ø§Ø± ÙˆØ§Ù‚Ø¹Ø§Ù‹ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡'],
];

export function GuidePage() {
  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Ù…Ø±Ø¬Ø¹ Ù…Ø­ØµÙˆÙ„"
        title="Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ ÙÙ†ÛŒ Ùˆ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯"
        description="ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§ÛŒ Ù‚Ø·Ø¹ÛŒ ÙÙ†ÛŒØŒ Ù…Ø±Ø²Ù‡Ø§ÛŒ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ø±Ø³Ù…ÛŒØŒ ØªÙØ§ÙˆØª Ø¯Ù…Ùˆ Ø¨Ø§ Ø­Ø§Ù„Øª Ø²Ù†Ø¯Ù‡ Ùˆ Ù‚ÙˆØ§Ø¹Ø¯ÛŒ Ú©Ù‡ Ù†Ø¨Ø§ÛŒØ¯ Ø¯Ø± UI Ø¬Ø§Ø¨Ù‡â€ŒØ¬Ø§ Ø´ÙˆÙ†Ø¯."
        actions={
          <Group gap="xs">
            <Badge variant="light" color="teal" leftSection={<CheckCircle size={13} />}>
              ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§ Ø«Ø¨Øª Ø´Ø¯
            </Badge>
            <Badge variant="light" color="orange" leftSection={<WarningCircle size={13} />}>
              Backend Ù¾ÛŒØ§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ù†Ø´Ø¯Ù‡
            </Badge>
          </Group>
        }
      />

      <InlineMessage tone="info" title="Ø§ÛŒÙ† Ø±Ø§Ø¨Ø· Ø¯Ø± Ø­Ø§Ù„Øª Ù†Ù…Ø§ÛŒØ´ÛŒ Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯">
        Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ Ø³Ø§Ø®ØªÚ¯ÛŒâ€ŒØ§Ù†Ø¯ Ùˆ Ø¯Ø± <Code>localStorage</Code> Ù†Ú¯Ù‡Ø¯Ø§Ø±ÛŒ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯. Ù‡ÛŒÚ† Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø´Ø¨Ú©Ù‡â€ŒØ§ÛŒ Ø¨Ù‡ Backend ÙˆØ§Ù‚Ø¹ÛŒ
        Ø§Ø±Ø³Ø§Ù„ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯Ø› Ø¨Ù†Ø§Ø¨Ø±Ø§ÛŒÙ† Ù†ØªÛŒØ¬Ù‡â€ŒÙ‡Ø§ Ø§Ø«Ø¨Ø§Øª Ø¹Ù…Ù„Ú©Ø±Ø¯ Ù…Ø­ØµÙˆÙ„ Ù†ÛŒØ³ØªÙ†Ø¯. Ø­Ø§Ù„Øª Ø²Ù†Ø¯Ù‡ ÙÙ‚Ø· Ù¾Ø³ Ø§Ø² Ù¾ÛŒØ§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Backend Ùˆ
        Ø§ØªØµØ§Ù„ adapter Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ ÙØ¹Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯.
      </InlineMessage>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <SectionCard
          title="Ù¾Ø´ØªÙ‡ Frontend"
          description="Ø§Ù†ØªØ®Ø§Ø¨â€ŒÙ‡Ø§ÛŒ Ù‚Ø·Ø¹ÛŒ Ùˆ Ù†Ø³Ø®Ù‡â€ŒÙ‡Ø§ÛŒ Ù†ØµØ¨â€ŒØ´Ø¯Ù‡"
          action={<CodeIcon size={20} color="#b91c1c" />}
        >
          <Box className="bn-scroll-x">
            <Table striped highlightOnHover verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Ø§Ø¨Ø²Ø§Ø±</Table.Th>
                  <Table.Th>Ù†Ø³Ø®Ù‡</Table.Th>
                  <Table.Th>Ù†Ù‚Ø´</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {FRONTEND_STACK.map(([name, version, role]) => (
                  <Table.Tr key={name}>
                    <Table.Td>
                      <Text size="sm" fw={600} className="bn-ltr">
                        {name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Code className="bn-ltr">{version}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {role}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        </SectionCard>

        <SectionCard
          title="Ù¾Ø´ØªÙ‡ Backend"
          description="ØªØµÙ…ÛŒÙ…â€ŒØ´Ø¯Ù‡ Ùˆ Ù…Ø³ØªÙ†Ø¯Ø› Ù‡Ù†ÙˆØ² Ú©Ø¯ Ø§Ø¬Ø±Ø§ÛŒÛŒ Ù†Ø¯Ø§Ø±Ø¯"
          action={<Database size={20} color="#be123c" />}
        >
          <Box className="bn-scroll-x">
            <Table striped highlightOnHover verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Ø§Ø¨Ø²Ø§Ø±</Table.Th>
                  <Table.Th>Ù†Ø³Ø®Ù‡ / ØªÙ†Ø¸ÛŒÙ…</Table.Th>
                  <Table.Th>Ù†Ù‚Ø´</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {BACKEND_STACK.map(([name, version, role]) => (
                  <Table.Tr key={name}>
                    <Table.Td>
                      <Text size="sm" fw={600} className="bn-ltr">
                        {name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Code className="bn-ltr">{version}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {role}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
          <Text size="xs" c="dimmed" mt="sm" lh={1.7}>
            SQLite Ø¨Ø±Ø§ÛŒ Ø³Ø§Ø¯Ú¯ÛŒ Ø§Ø¬Ø±Ø§ÛŒ Ù…Ø­Ù„ÛŒ Ùˆ Ø¯Ù…Ùˆ Ø§Ù†ØªØ®Ø§Ø¨ Ø´Ø¯Ù‡ Ø§Ø³Øª. Ù…Ø³ÛŒØ± Ù…Ù‡Ø§Ø¬Ø±Øª Ø¨Ù‡ PostgreSQL Ùˆ Ù…Ø­Ø¯ÙˆØ¯ÛŒØª ØªÚ©â€ŒÙ†ÙˆÛŒØ³Ù†Ø¯Ù‡
            Ø¨Ø§ÛŒØ¯ Ø¯Ø± Ø·Ø±Ø§Ø­ÛŒ Backend Ù…Ø³ØªÙ†Ø¯ Ø´ÙˆØ¯Ø› SQLite Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† ØªØµÙ…ÛŒÙ… production Ù†ÛŒØ³Øª.
          </Text>
        </SectionCard>
      </SimpleGrid>

      <SectionCard
        title="Ø§Ø¬Ø±Ø§ÛŒ Ù…Ø­Ù„ÛŒ"
        description="Ø¯Ø³ØªÙˆØ±Ù‡Ø§ÛŒ Frontend Ùˆ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ù…Ø­ÛŒØ·"
        action={<Gear size={20} color="#b91c1c" />}
      >
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Stack gap="xs">
            <Text size="sm" fw={700}>Ù†ØµØ¨ Ùˆ ØªÙˆØ³Ø¹Ù‡</Text>
            <Code block className="bn-ltr">cd frontend{'\n'}npm install{'\n'}npm run dev</Code>
            <Text size="xs" c="dimmed">
              Vite Ø±ÙˆÛŒ Ù¾ÙˆØ±Øª <Code>5173</Code> Ø§Ø¬Ø±Ø§ Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ <Code>/api</Code> Ø±Ø§ Ø¨Ù‡ <Code>http://localhost:8000</Code>
              {' '}Ù¾Ø±ÙˆÚ©Ø³ÛŒ Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Backend Ù‡Ù†ÙˆØ² Ø§Ø¬Ø±Ø§ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
            </Text>
          </Stack>
          <Stack gap="xs">
            <Text size="sm" fw={700}>Ø³Ø§Ø®Øª Ùˆ Ø¨Ø±Ø±Ø³ÛŒ</Text>
            <Code block className="bn-ltr">npm run typecheck{'\n'}npm run build{'\n'}npm run preview</Code>
            <Text size="xs" c="dimmed">
              Ù…ØªØºÛŒØ±Ù‡Ø§ÛŒ Ø¹Ù…ÙˆÙ…ÛŒ: <Code>VITE_DEMO_MODE=true</Code> Ùˆ <Code>VITE_API_BASE_URL=/api</Code>. Ù‡ÛŒÚ†
              ØªÙˆÚ©Ù† ÛŒØ§ Ø±Ù…Ø²ÛŒ Ø¯Ø± Frontend Ø°Ø®ÛŒØ±Ù‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
            </Text>
          </Stack>
        </SimpleGrid>
      </SectionCard>

      <SectionCard
        title="Ø®Ù„Ø§ØµÙ‡ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ø±Ø³Ù…ÛŒ"
        description="ÙÙ‚Ø· endpointÙ‡Ø§ÛŒ Ø¯Ø§Ø±Ø§ÛŒ Ù…Ù†Ø¨Ø¹ Ø¯Ø± OpenAPI Ú©ÛŒØª"
        action={<BookOpen size={20} color="#be123c" />}
      >
        <Box className="bn-scroll-x">
          <Table striped highlightOnHover verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Ù…Ø³ÛŒØ±</Table.Th>
                <Table.Th>Ø§Ø­Ø±Ø§Ø² Ù‡ÙˆÛŒØª</Table.Th>
                <Table.Th>Ù†Ù‚Ø´ Ùˆ Ù†Ú©ØªÙ‡</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {CONTRACT_ROWS.map(([path, auth, note]) => (
                <Table.Tr key={path}>
                  <Table.Td>
                    <Code className="bn-ltr">{path}</Code>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" className="bn-ltr" c={auth.includes('Ø¨Ø¯ÙˆÙ†') ? 'dimmed' : undefined}>
                      {auth}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{note}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
        <InlineMessage tone="warning" title="Ù†Ø¨ÙˆØ¯ endpoint ÙÙ‡Ø±Ø³Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§">
          OpenAPI Ø±Ø³Ù…ÛŒ endpoint ÙÙ‡Ø±Ø³Øª Ú©Ø§Ù…Ù„ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ Ø±Ø§ Ù†Ø¯Ø§Ø±Ø¯. Ø§ÛŒÙ† UI Ø¯Ø± Ø­Ø§Ù„Øª Ø¯Ù…Ùˆ Ø§Ø² Ø¯Ø§Ø¯Ù‡ seed Ø§Ø³ØªÙØ§Ø¯Ù‡ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
          Ø¨Ø±Ø§ÛŒ Ø­Ø§Ù„Øª Ø²Ù†Ø¯Ù‡ Ø¨Ø§ÛŒØ¯ ÛŒÚ© endpoint Ø¯Ø§Ø®Ù„ÛŒ ÛŒØ§ ØªØ¬Ù…ÛŒØ¹ Ø³Ù…Øª Ù…Ø­ØµÙˆÙ„ Ø§Ø¶Ø§ÙÙ‡ Ø´ÙˆØ¯Ø› Ø§Ø®ØªØ±Ø§Ø¹ ÛŒÚ© Ù…Ø³ÛŒØ± Ø¹Ù…ÙˆÙ…ÛŒ Ø¨Ø¯ÙˆÙ† Ù…Ù†Ø¨Ø¹
          Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª.
        </InlineMessage>
      </SectionCard>

      <SectionCard title="Ù¾Ù†Ø¬ Ú©Ù…ÛŒØª Ù…Ø³ØªÙ‚Ù„" description="Ø§ÛŒÙ† Ù¾Ù†Ø¬ Ø¹Ø¯Ø¯ Ø±Ø§ Ù‡Ø±Ú¯Ø² Ø¨Ø§ Ù‡Ù… Ø§Ø¯ØºØ§Ù… Ù†Ú©Ù†ÛŒØ¯">
        <Box className="bn-scroll-x">
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Ø¨Ø±Ú†Ø³Ø¨ ÙØ§Ø±Ø³ÛŒ</Table.Th>
                <Table.Th>Ù†Ø§Ù… ÙÙ†ÛŒ</Table.Th>
                <Table.Th>Ù…Ø¹Ù†Ø§</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {FIVE_QUANTITIES.map(([fa, technical, meaning]) => (
                <Table.Tr key={technical}>
                  <Table.Td>
                    <Text size="sm" fw={700}>{fa}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Code className="bn-ltr">{technical}</Code>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">{meaning}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
        <InlineMessage tone="danger" title="Ù‚Ø§Ø¹Ø¯Ù‡ Ø§ÛŒÙ…Ù†ÛŒ ØªØ£Ù…ÛŒÙ†">
          Ù¾Ø°ÛŒØ±Ø´ Ø¯Ø¹ÙˆØªØŒ Ø­Ø±Ú©ØªØŒ Ø±Ø³ÛŒØ¯Ù†ØŒ Ù‚Ø¨ÙˆÙ„ÛŒ ØºØ±Ø¨Ø§Ù„Ú¯Ø±ÛŒØŒ ØªØ®ØµÛŒØµ Ù…ÙˆØ¬ÙˆØ¯ÛŒ ÛŒØ§ ØªØ­ÙˆÛŒÙ„ Ù¾ÛŒØ§Ù… Gateway Ù‡ÛŒÚ†â€ŒÚ©Ø¯Ø§Ù… Ø§Ù‡Ø¯Ø§ Ù†ÛŒØ³ØªÙ†Ø¯.
          ÙÙ‚Ø· callback Ù…Ø¹ØªØ¨Ø± <Code>donated</Code> Ù…Ù‚Ø¯Ø§Ø± Â«ÙˆØ§Ù‚Ø¹Ø§Ù‹ ØªØ£Ù…ÛŒÙ†â€ŒØ´Ø¯Ù‡Â» Ø±Ø§ Ø§ÙØ²Ø§ÛŒØ´ Ù…ÛŒâ€ŒØ¯Ù‡Ø¯.
        </InlineMessage>
      </SectionCard>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <SectionCard title="ÙˆØ¶Ø¹ÛŒØªâ€ŒÙ‡Ø§ÛŒ Ø±Ø³Ù…ÛŒ Ø¯Ø±Ø®ÙˆØ§Ø³Øª">
          <Stack gap="xs">
            {[
              ['pending_review', 'Ø¯Ø± Ø§Ù†ØªØ¸Ø§Ø± Ø¨Ø±Ø±Ø³ÛŒ'],
              ['open', 'Ø¨Ø§Ø²'],
              ['mobilizing', 'Ø¯Ø± Ø­Ø§Ù„ Ø¨Ø³ÛŒØ¬'],
              ['partially_fulfilled', 'ØªØ£Ù…ÛŒÙ† Ø¬Ø²Ø¦ÛŒ'],
              ['fulfilled', 'ØªØ£Ù…ÛŒÙ† Ú©Ø§Ù…Ù„'],
              ['cancelled', 'Ù„ØºÙˆØ´Ø¯Ù‡'],
              ['expired', 'Ù…Ù†Ù‚Ø¶ÛŒ'],
            ].map(([code, label]) => (
              <Group key={code} justify="space-between">
                <Code className="bn-ltr">{code}</Code>
                <Text size="sm">{label}</Text>
              </Group>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard title="Ù…Ø­ØµÙˆÙ„Ø§Øª Ùˆ Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§ÛŒ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡">
          <Stack gap="sm">
            <Group gap="xs">
              <Badge variant="light">red_cells</Badge>
              <Badge variant="light">platelets</Badge>
              <Badge variant="light">plasma</Badge>
            </Group>
            <Text size="xs" c="dimmed" lh={1.8}>
              ÙÙ‚Ø· Ù‡Ù…ÛŒÙ† Ø³Ù‡ Ù…Ø­ØµÙˆÙ„ Ù…Ø¬Ø§Ø²Ù†Ø¯Ø› ÙÛŒÙ„Ø¯ Ø±Ø³Ù…ÛŒ <Code>product</Code> Ø§Ø³Øª Ùˆ <Code>product_type</Code> Ù‡Ø±Ú¯Ø²
              Ø§Ø±Ø³Ø§Ù„ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯. Ú¯Ø±ÙˆÙ‡â€ŒÙ‡Ø§ÛŒ Ø®ÙˆÙ†ÛŒ: O+, A+, B+, AB+, O-, A-, B-, AB-.
            </Text>
            <Divider />
            <Text size="sm" fw={700}>Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§ÛŒ Ù…Ø³ÛŒØ± Ø§Ù‡Ø¯Ø§</Text>
            <Text size="xs" c="dimmed" lh={1.8}>
              <Code>accepted</Code>ØŒ <Code>en_route</Code>ØŒ <Code>arrived</Code>ØŒ{' '}
              <Code>screen_pass</Code>ØŒ <Code>screen_fail</Code>ØŒ <Code>donated</Code>ØŒ{' '}
              <Code>no_show</Code> Ùˆ <Code>declined</Code> Ù…Ø³ØªÙ‚Ù„â€ŒØ§Ù†Ø¯. Gateway Ù†ÛŒØ² ÙˆØ¶Ø¹ÛŒØªâ€ŒÙ‡Ø§ÛŒ{' '}
              <Code>queued</Code>ØŒ <Code>sent</Code>ØŒ <Code>delivered</Code>ØŒ <Code>failed</Code> Ùˆ{' '}
              <Code>expired</Code> Ø±Ø§ Ø¬Ø¯Ø§ Ù†Ú¯Ù‡ Ù…ÛŒâ€ŒØ¯Ø§Ø±Ø¯.
            </Text>
          </Stack>
        </SectionCard>
      </SimpleGrid>

      <SectionCard
        title="Ø¯Ù…Ùˆ Ø¯Ø± Ø¨Ø±Ø§Ø¨Ø± Ø­Ø§Ù„Øª Ø²Ù†Ø¯Ù‡"
        description="Ù…Ø±Ø² ØµØ¯Ø§Ù‚Øª ÙÙ†ÛŒ Ø¯Ø± ØªØ­ÙˆÛŒÙ„"
        action={<Info size={20} color="#B45309" />}
      >
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <Box className="rounded-xl border border-[var(--bn-border)] p-3">
            <Text size="sm" fw={700}>Ø§Ú©Ù†ÙˆÙ†</Text>
            <Text size="xs" c="dimmed" mt={4} lh={1.75}>
              Store Ù…Ø­Ù„ÛŒØŒ seed Ø¯Ø§Ø¯Ù‡ØŒ Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒ Ú¯Ø°Ø§Ø±Ù‡Ø§ Ùˆ audit. Ù‡ÛŒÚ† ØªÙ…Ø§Ø³ Ø´Ø¨Ú©Ù‡â€ŒØ§ÛŒ ÛŒØ§ Ø°Ø®ÛŒØ±Ù‡â€ŒØ³Ø§Ø²ÛŒ Ø³Ù…Øª Ø³Ø±ÙˆØ± ÙˆØ¬ÙˆØ¯
              Ù†Ø¯Ø§Ø±Ø¯.
            </Text>
          </Box>
          <Box className="rounded-xl border border-[var(--bn-border)] p-3">
            <Text size="sm" fw={700}>Ø­Ø§Ù„Øª Ø²Ù†Ø¯Ù‡</Text>
            <Text size="xs" c="dimmed" mt={4} lh={1.75}>
              adapter ØªØ§ÛŒÙ¾â€ŒØ´Ø¯Ù‡ Ø¨Ù‡ <Code>VITE_API_BASE_URL</Code>ØŒ ØªÙˆÚ©Ù† Ø¯Ù…Ùˆ Ø§Ø² Ù…Ø­ÛŒØ·ØŒ Ù…Ø¯ÛŒØ±ÛŒØª 400/401/404/409/422/429/503
              Ùˆ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ø³Ø§Ø¹Øª Gateway.
            </Text>
          </Box>
          <Box className="rounded-xl border border-[var(--bn-border)] p-3">
            <Text size="sm" fw={700}>Ù¾ÛŒØ´â€ŒÙ†ÛŒØ§Ø²</Text>
            <Text size="xs" c="dimmed" mt={4} lh={1.75}>
              Ù¾ÛŒØ§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ BackendØŒ endpoint ÙÙ‡Ø±Ø³Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ØŒ Ø§ØªØµØ§Ù„ callbackÙ‡Ø§ Ùˆ Ø¢Ø²Ù…ÙˆÙ† Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯. ØªØ§ Ø¢Ù† Ø²Ù…Ø§Ù†
              Ø§Ø¯Ø¹Ø§ÛŒ AC-014 Ú©Ø§Ù…Ù„ Ù†ÛŒØ³Øª.
            </Text>
          </Box>
        </SimpleGrid>
      </SectionCard>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <SectionCard title="Ø§Ù…Ù†ÛŒØª Ùˆ Ø¯Ø§Ø¯Ù‡" action={<ShieldCheck size={20} color="#067647" />}>
          <Stack gap="xs">
            <Text size="xs" lh={1.8}>
              ØªÙˆÚ©Ù†â€ŒÙ‡Ø§ÛŒ <Code>hospitalBearer</Code> Ùˆ <Code>coordinatorBearer</Code> Ø¯Ø± Ø¯Ù…Ùˆ Ù…Ù‚Ø¯Ø§Ø± Ø«Ø§Ø¨Øª Ø¯Ø§Ø±Ù†Ø¯ Ùˆ
              Ø±Ø§Ø² ÙˆØ§Ù‚Ø¹ÛŒ Ù†ÛŒØ³ØªÙ†Ø¯. Ù‡ÛŒÚ† Ø±Ù…Ø²ØŒ PATØŒ Ú©Ù„ÛŒØ¯ Ø®ØµÙˆØµÛŒ ÛŒØ§ ÙØ§ÛŒÙ„ <Code>.env</Code> Ø¯Ø± Ù…Ø®Ø²Ù† Ø°Ø®ÛŒØ±Ù‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯.
            </Text>
            <Text size="xs" c="dimmed" lh={1.8}>
              Ø¯Ø§Ø¯Ù‡ Ø¨ÛŒÙ…Ø§Ø±Ø§Ù† Ø³Ø§Ø®ØªÚ¯ÛŒ Ø§Ø³Øª. Ø§ÛŒÙ† Ù…Ø­ØµÙˆÙ„ Ù…Ø´Ø§ÙˆØ±Ù‡ Ù¾Ø²Ø´Ú©ÛŒ Ù†Ù…ÛŒâ€ŒØ¯Ù‡Ø¯ Ùˆ Ù†Ø¨Ø§ÛŒØ¯ Ø¨Ø±Ø§ÛŒ ØªØµÙ…ÛŒÙ… Ø¨Ø§Ù„ÛŒÙ†ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ Ø§Ø³ØªÙØ§Ø¯Ù‡
              Ø´ÙˆØ¯.
            </Text>
          </Stack>
        </SectionCard>

        <SectionCard title="Smart Service" action={<Info size={20} color="#be123c" />}>
          <Text size="xs" lh={1.8}>
            ØªØµÙ…ÛŒÙ…: ÛŒÚ© Ù…Ø§Ú˜ÙˆÙ„ Ù…Ø´ÙˆØ±ØªÛŒ Ù‚Ø·Ø¹ÛŒ Ùˆ Ù‚Ø§Ø¨Ù„ ØªÙˆØ¶ÛŒØ­ Ø¨Ø± Ù¾Ø§ÛŒÙ‡ Ù‚ÙˆØ§Ø¹Ø¯ (Ø§ÙˆÙ„ÙˆÛŒØªØŒ ØªÙˆØ¶ÛŒØ­ Ú©Ù…Ø¨ÙˆØ¯ Ùˆ Ù¾ÛŒØ´Ù†Ù‡Ø§Ø¯ ØªØ®ØµÛŒØµ) Ø¨Ø¯ÙˆÙ†
            LLM Ùˆ Ø¨Ø¯ÙˆÙ† ØªØµÙ…ÛŒÙ… Ù¾Ø²Ø´Ú©ÛŒ. feature-flag Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ Ø¯Ø± Ø§ÛŒÙ† Ù…Ø±Ø­Ù„Ù‡ Ù¾ÛŒØ§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª. Ø§Ú¯Ø± ØªØ­ÙˆÛŒÙ„ Ø¯Ø§Ø¯Ù‡ Ø´ÙˆØ¯ØŒ
            Ø¨Ø§ÛŒØ¯ <Code>DECLARED.md</Code> Ùˆ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø®ÙˆØ¯Ø´ Ø±Ø§ Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯.
          </Text>
        </SectionCard>
      </SimpleGrid>

      <SectionCard title="Ù…Ø³ØªÙ†Ø¯Ø§Øª Ù…Ø±ØªØ¨Ø·" description="Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ù…Ø®Ø²Ù† Ø¨Ø±Ø§ÛŒ ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§ Ùˆ Ú¯Ø±Ø¯Ø´ Ú©Ø§Ø±">
        <Stack gap="xs">
          <Text size="sm">
            <Code className="bn-ltr">docs/technology-decisions.md</Code> â€” ØªØµÙ…ÛŒÙ…â€ŒÙ‡Ø§ÛŒ Ù‚Ø·Ø¹ÛŒ Backend Ùˆ Frontend
          </Text>
          <Text size="sm">
            <Code className="bn-ltr">docs/git-workflow.md</Code> â€” Ø´Ø§Ø®Ù‡â€ŒÙ‡Ø§ØŒ Ù‡ÙˆÛŒØª commit Ùˆ push
          </Text>
          <Text size="sm">
            <Code className="bn-ltr">participant_kit/openapi.yaml</Code> â€” Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ø±Ø³Ù…ÛŒ
          </Text>
          <Text size="sm">
            <Code className="bn-ltr">participant_kit/compat.yaml</Code> â€” ØªÙ†Ù‡Ø§ Ù…Ù†Ø¨Ø¹ Ø³Ø§Ø²Ú¯Ø§Ø±ÛŒ Ø®ÙˆÙ†ÛŒ
          </Text>
        </Stack>
        <Divider my="md" />
        <Group gap="xs">
          <Badge variant="light" color="teal">Persian RTL</Badge>
          <Badge variant="light" color="cyan">Accessible</Badge>
          <Badge variant="light" color="orange">Demo mode</Badge>
        </Group>
      </SectionCard>

      <Text size="xs" c="dimmed" ta="center">
        BloodNet â€” Ø±Ø§Ø¨Ø· Ù†Ù…Ø§ÛŒØ´ÛŒ Ù‡Ù…Ø§Ù‡Ù†Ú¯ÛŒ Ø§Ù‡Ø¯Ø§ÛŒ Ø®ÙˆÙ†. Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ Ø³Ø§Ø®ØªÚ¯ÛŒ Ùˆ ØºÛŒØ±Ù¾Ø²Ø´Ú©ÛŒ Ù‡Ø³ØªÙ†Ø¯.
      </Text>
    </Stack>
  );
}

