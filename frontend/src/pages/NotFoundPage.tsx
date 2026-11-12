import { Button, Stack } from '@mantine/core';
import { ArrowRight, Compass } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../components/StateViews';

export function NotFoundPage() {
  return (
    <Stack justify="center" mih="60vh">
      <ErrorState
        code="۴۰۴"
        title="این مسیر در BloodNet وجود ندارد"
        description="نشانی واردشده معتبر نیست یا صفحه جابه‌جا شده است. از داشبورد یا فهرست درخواست‌ها ادامه دهید."
        action={
          <Button
            component={Link}
            to="/"
            color="brand"
            leftSection={<ArrowRight size={16} />}
          >
            بازگشت به داشبورد
          </Button>
        }
      />
      <Stack align="center" gap={4}>
        <Compass size={18} color="#526D71" aria-hidden="true" />
        <span className="text-xs text-[var(--bn-muted)]">
          مسیرهای اصلی: داشبورد، درخواست‌ها، موجودی، اهداکننده و رویدادها
        </span>
      </Stack>
    </Stack>
  );
}
