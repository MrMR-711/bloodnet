import type { ReactNode } from 'react';
import { Box, Button, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { ArrowRight, MagnifyingGlass, WarningCircle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon = <MagnifyingGlass size={24} />,
  action,
}: EmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap="sm" py={54} px="md" ta="center">
      <ThemeIcon size={54} radius="xl" variant="light" color="brand" aria-hidden="true">
        {icon}
      </ThemeIcon>
      <Text fw={700} fz="md">
        {title}
      </Text>
      <Text size="sm" c="dimmed" maw={440} lh={1.8}>
        {description}
      </Text>
      {action && <Box mt="xs">{action}</Box>}
    </Stack>
  );
}

interface ErrorStateProps {
  code?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function ErrorState({ code = 'خطا', title, description, action }: ErrorStateProps) {
  return (
    <Paper className="bn-card" p="xl">
      <Stack align="center" gap="sm" ta="center" maw={520} mx="auto">
        <ThemeIcon size={58} radius="xl" variant="light" color="crimson" aria-hidden="true">
          <WarningCircle size={28} weight="duotone" />
        </ThemeIcon>
        <Text size="xs" fw={700} c="crimson" tt="uppercase" style={{ letterSpacing: '0.1em' }}>
          {code}
        </Text>
        <Title order={2} fz="xl">
          {title}
        </Title>
        <Text size="sm" c="dimmed" lh={1.8}>
          {description}
        </Text>
        {action ?? (
          <Button
            component={Link}
            to="/"
            variant="light"
            color="brand"
            mt="xs"
            leftSection={<ArrowRight size={16} />}
          >
            بازگشت به داشبورد
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

interface InlineMessageProps {
  title: string;
  children: ReactNode;
  tone?: 'info' | 'warning' | 'danger' | 'success';
}

const TONE_STYLES = {
  info: { background: '#EDF9F8', border: '#C7E8E2', color: '#0B5F59' },
  warning: { background: '#FFF8E6', border: '#F3D9A4', color: '#7A3E06' },
  danger: { background: '#FFF1F0', border: '#F5C4C0', color: '#8B2B26' },
  success: { background: '#ECFDF3', border: '#BBE8CD', color: '#05603A' },
} as const;

export function InlineMessage({ title, children, tone = 'info' }: InlineMessageProps) {
  const style = TONE_STYLES[tone];
  return (
    <Box
      role="note"
      p="sm"
      style={{
        background: style.background,
        border: `1px solid ${style.border}`,
        borderRadius: 12,
        color: style.color,
      }}
    >
      <Group gap={8} align="flex-start" wrap="nowrap">
        <WarningCircle size={18} weight="bold" style={{ flex: '0 0 auto', marginTop: 2 }} aria-hidden="true" />
        <Box>
          <Text size="sm" fw={700} lh={1.6}>
            {title}
          </Text>
          <Text size="xs" lh={1.75} mt={2} style={{ color: 'inherit' }}>
            {children}
          </Text>
        </Box>
      </Group>
    </Box>
  );
}
