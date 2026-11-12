import { Alert, Anchor, Group, Text } from '@mantine/core';
import { Info, ArrowLeft } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export function DemoBanner() {
  return (
    <Alert
      color="cyan"
      variant="light"
      radius="lg"
      mb="lg"
      py="xs"
      icon={<Info size={18} weight="bold" aria-hidden="true" />}
      title={
        <Text size="sm" fw={700}>
          حالت نمایشی فعال است
        </Text>
      }
    >
      <Group justify="space-between" gap="sm" wrap="wrap">
        <Text size="xs" lh={1.7}>
          داده‌ها ساختگی و برای نمایش جریان کاری است؛ Backend محصول هنوز متصل نیست.
        </Text>
        <Anchor component={Link} to="/guide" size="xs" fw={700} c="cyan.8">
          <Group gap={4} wrap="nowrap">
            جزئیات و محدودیت‌ها
            <ArrowLeft size={12} weight="bold" aria-hidden="true" />
          </Group>
        </Anchor>
      </Group>
    </Alert>
  );
}
