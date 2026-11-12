import { Alert, Anchor, Group, Text } from '@mantine/core';
import { Info, ArrowLeft } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export function DemoBanner() {
  return (
    <Alert
      color="red"
      variant="light"
      radius="lg"
      mb="lg"
      py="xs"
      icon={<Info size={18} weight="bold" aria-hidden="true" />}
      title={
        <Text size="sm" fw={700}>
          حالت نمایشی داده‌ها
        </Text>
      }
    >
      <Group justify="space-between" gap="sm" wrap="wrap">
        <Text size="xs" lh={1.7}>
          داده‌های این نمایش ساختگی و محلی هستند؛ وضعیت اتصال API در هدر نمایش داده می‌شود.
        </Text>
        <Anchor component={Link} to="/guide" size="xs" fw={700} c="red.8">
          <Group gap={4} wrap="nowrap">
            جزئیات و محدودیت‌ها
            <ArrowLeft size={12} weight="bold" aria-hidden="true" />
          </Group>
        </Anchor>
      </Group>
    </Alert>
  );
}
