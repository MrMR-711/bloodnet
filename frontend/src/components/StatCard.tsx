import type { ReactNode } from 'react';
import { Box, Group, Paper, Text, ThemeIcon } from '@mantine/core';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  color?: string;
}

export function StatCard({ label, value, hint, icon, color = 'brand' }: StatCardProps) {
  return (
    <Paper className="bn-card bn-kpi-card" p="md" h="100%">
      <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
        <Box className="min-w-0">
          <Text size="xs" c="dimmed" fw={600} lh={1.5}>
            {label}
          </Text>
          <Text
            className="bn-number mt-1 text-[1.55rem] font-extrabold leading-tight text-[var(--bn-ink)]"
            lh={1.2}
          >
            {value}
          </Text>
        </Box>
        <ThemeIcon color={color} variant="light" size={42} radius="md" aria-hidden="true">
          {icon}
        </ThemeIcon>
      </Group>
      {hint && (
        <Text size="xs" c="dimmed" mt="sm" lh={1.6}>
          {hint}
        </Text>
      )}
    </Paper>
  );
}
