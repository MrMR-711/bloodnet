import type { ReactNode } from 'react';
import { Box, Group, Paper, Stack, Text } from '@mantine/core';

interface SectionCardProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noBodyPadding?: boolean;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  noBodyPadding = false,
}: SectionCardProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <Paper className={`bn-card ${className ?? ''}`} p={0}>
      {hasHeader && (
        <Group
          justify="space-between"
          align="flex-start"
          gap="md"
          p="lg"
          pb={noBodyPadding ? 'md' : 'sm'}
          wrap="nowrap"
        >
          <Stack gap={2}>
            {title && (
              <Text component="h2" fw={700} fz="md" lh={1.45}>
                {title}
              </Text>
            )}
            {description && (
              <Text size="xs" c="dimmed" lh={1.65}>
                {description}
              </Text>
            )}
          </Stack>
          {action && <Box className="shrink-0">{action}</Box>}
        </Group>
      )}
      <Box
        className={bodyClassName}
        p={noBodyPadding ? 0 : 'lg'}
        pt={hasHeader && !noBodyPadding ? 0 : undefined}
      >
        {children}
      </Box>
    </Paper>
  );
}
