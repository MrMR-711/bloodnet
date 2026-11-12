import type { ReactNode } from 'react';
import { Box, Group, Stack, Text, Title } from '@mantine/core';

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <Stack gap="md" className="bn-fade-in">
      {eyebrow && (
        <Text
          size="xs"
          fw={700}
          c="brand.7"
          tt="uppercase"
          style={{ letterSpacing: '0.08em' }}
        >
          {eyebrow}
        </Text>
      )}
      <Group justify="space-between" align="flex-end" gap="md" wrap="wrap">
        <Box className="min-w-0">
          <Title
            order={1}
            className="text-[1.55rem] leading-[1.35] text-[var(--bn-ink)] sm:text-[1.9rem]"
          >
            {title}
          </Title>
          {description && (
            <Text size="sm" c="dimmed" mt={6} maw={760} lh={1.8}>
              {description}
            </Text>
          )}
        </Box>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
    </Stack>
  );
}
