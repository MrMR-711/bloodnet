import { useEffect } from 'react';
import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Button,
  Divider,
  Group,
  Indicator,
  Menu,
  Modal,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import type { Icon } from '@phosphor-icons/react';
import {
  ArrowsClockwise,
  Bell,
  BookOpen,
  CheckCircle,
  ClipboardText,
  Clock,
  Drop,
  FirstAidKit,
  Gear,
  Heartbeat,
  House,
  Info,
  ListBullets,
  Plus,
  ShieldCheck,
  SignOut,
  Sparkle,
  UsersThree,
} from '@phosphor-icons/react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BrandMark } from './BrandMark';
import { DemoBanner } from './DemoBanner';
import { useDemoStore } from '../data/DemoStoreContext';
import { formatDateTime } from '../lib/format';
import { initials } from '../lib/format';

interface NavItem {
  to: string;
  label: string;
  description: string;
  icon: Icon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'عملیات',
    items: [
      { to: '/', label: 'داشبورد', description: 'نمای کلی شبکه', icon: House },
      { to: '/requests', label: 'درخواست‌ها', description: 'پیگیری تأمین', icon: ClipboardText },
      { to: '/requests/new', label: 'ثبت درخواست', description: 'درخواست جدید', icon: Plus },
      { to: '/inventory', label: 'موجودی مراکز', description: 'FEFO و تخصیص', icon: Drop },
      { to: '/donor', label: 'پورتال اهداکننده', description: 'دعوت و پیشرفت', icon: UsersThree },
    ],
  },
  {
    title: 'شفافیت',
    items: [
      { to: '/audit', label: 'رویدادها', description: 'Audit Trail', icon: ListBullets },
      { to: '/guide', label: 'راهنما', description: 'قرارداد و اجرا', icon: BookOpen },
    ],
  },
];

function isActivePath(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/';
  if (to === '/requests') {
    return pathname === '/requests' ||
      (pathname.startsWith('/requests/') && pathname !== '/requests/new');
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function pageMeta(pathname: string): { title: string; subtitle: string } {
  if (pathname === '/') return { title: 'داشبورد عملیات', subtitle: 'نمای کلی شبکه اهدای خون' };
  if (pathname === '/requests') return { title: 'درخواست‌ها', subtitle: 'چرخه تأمین و وضعیت رسمی' };
  if (pathname === '/requests/new') return { title: 'ثبت درخواست', subtitle: 'ایجاد درخواست جدید' };
  if (pathname.startsWith('/requests/')) {
    return { title: 'جزئیات درخواست', subtitle: pathname.replace('/requests/', '') };
  }
  if (pathname === '/inventory') return { title: 'موجودی مراکز', subtitle: 'FEFO و تخصیص اتمی' };
  if (pathname === '/donor') return { title: 'پورتال اهداکننده', subtitle: 'دعوت، مسیر و اهدا' };
  if (pathname === '/audit') return { title: 'رویدادها', subtitle: 'ردپای تغییرات و Callbackها' };
  if (pathname === '/guide') return { title: 'راهنما', subtitle: 'قرارداد، اجرا و محدودیت‌ها' };
  return { title: 'BloodNet', subtitle: 'مرکز فرمان اهدای خون' };
}

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const [resetOpen, resetModal] = useDisclosure();
  const { state, resetDemo } = useDemoStore();
  const { pathname } = useLocation();
  const meta = pageMeta(pathname);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    document.title = `${meta.title} · BloodNet`;
  }, [meta.title]);

  const handleReset = () => {
    resetDemo();
    resetModal.close();
    notifications.show({
      title: 'داده نمایشی بازنشانی شد',
      message: 'همه درخواست‌ها، موجودی و رویدادها به حالت اولیه برگشتند.',
      color: 'green',
      icon: <CheckCircle size={18} weight="fill" />,
    });
  };

  return (
    <AppShell
      header={{ height: 68 }}
      navbar={{ width: 284, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding={0}
    >
      <AppShell.Header
        className="border-b bg-white/95 backdrop-blur"
        style={{ borderColor: 'var(--bn-border)' }}
      >
        <Group h="100%" px={{ base: 'sm', sm: 'md' }} justify="space-between" gap="sm" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" className="min-w-0">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="md"
              size="sm"
              aria-label="باز کردن منوی اصلی"
            />
            <Group gap="xs" wrap="nowrap" className="md:hidden">
              <BrandMark size={28} />
              <Text fw={800} fz="md">
                BloodNet
              </Text>
            </Group>
            <Box visibleFrom="md" className="min-w-0">
              <Text fw={700} fz="sm" lh={1.3} truncate>
                {meta.title}
              </Text>
              <Text size="xs" c="dimmed" lh={1.4} truncate>
                {meta.subtitle}
              </Text>
            </Box>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Tooltip label="ساعت شبیه‌سازی از Gateway">
              <Box visibleFrom="sm">
                <Badge
                  variant="light"
                  color="brand"
                  size="lg"
                  radius="md"
                  leftSection={<Clock size={13} weight="bold" aria-hidden="true" />}
                >
                  <span className="bn-number">{formatDateTime(state.sim_time)}</span>
                </Badge>
              </Box>
            </Tooltip>

            <Menu shadow="md" width={330} position="bottom-end" radius="md">
              <Menu.Target>
                <ActionIcon
                  variant="light"
                  color="gray"
                  size="lg"
                  radius="md"
                  aria-label="اعلان‌ها"
                >
                  <Indicator color="crimson" size={8} offset={4} processing>
                    <Bell size={19} weight="duotone" />
                  </Indicator>
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>اعلان‌های نمایشی</Menu.Label>
                <Menu.Item
                  leftSection={<Heartbeat size={17} color="#C2413A" />}
                  component={Link}
                  to="/requests/REQ-2027-0101"
                >
                  <Text size="sm" fw={600}>درخواست بحرانی O+</Text>
                  <Text size="xs" c="dimmed">بیمارستان امام رضا — ۶ واحد</Text>
                </Menu.Item>
                <Menu.Item
                  leftSection={<Info size={17} color="#0E7490" />}
                  component={Link}
                  to="/inventory"
                >
                  <Text size="sm" fw={600}>هشدار انقضای موجودی</Text>
                  <Text size="xs" c="dimmed">۲ ردیف کمتر از ۶ ساعت</Text>
                </Menu.Item>
                <Menu.Item
                  leftSection={<UsersThree size={17} color="#0F766E" />}
                  component={Link}
                  to="/donor"
                >
                  <Text size="sm" fw={600}>دعوت‌های در انتظار پاسخ</Text>
                  <Text size="xs" c="dimmed">۲ اهداکننده</Text>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu shadow="md" width={250} position="bottom-end" radius="md">
              <Menu.Target>
                <UnstyledButton
                  className="rounded-xl px-2 py-1 transition-colors hover:bg-[#F0F6F5]"
                  aria-label="منوی کاربر"
                >
                  <Group gap="xs" wrap="nowrap">
                    <Avatar color="brand" radius="xl" size={34}>
                      {initials('مدیر شبکه')}
                    </Avatar>
                    <Box visibleFrom="sm" className="text-start">
                      <Text size="xs" fw={700} lh={1.25}>مدیر شبکه</Text>
                      <Text size="xs" c="dimmed" lh={1.25}>دسترسی هماهنگ‌کننده</Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>حساب نمایشی</Menu.Label>
                <Menu.Item leftSection={<Gear size={16} />} disabled>
                  تنظیمات نقش
                </Menu.Item>
                <Menu.Item leftSection={<BookOpen size={16} />} component={Link} to="/guide">
                  راهنمای اجرا و قرارداد
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<ArrowsClockwise size={16} />}
                  onClick={resetModal.open}
                >
                  بازنشانی داده نمایشی
                </Menu.Item>
                <Menu.Item leftSection={<SignOut size={16} />} disabled>
                  خروج (در دمو غیرفعال)
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        className="bg-white"
        style={{ borderInlineEnd: '1px solid var(--bn-border)' }}
      >
        <Stack h="100%" justify="space-between" gap="md">
          <Stack gap="lg" className="min-h-0 flex-1">
            <Group gap="sm" wrap="nowrap" px={4}>
              <Box className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B3B46] shadow-sm">
                <BrandMark size={30} />
              </Box>
              <Box className="min-w-0">
                <Group gap={6} wrap="nowrap">
                  <Text fw={800} fz="lg" lh={1.2} className="bn-gradient-text">
                    BloodNet
                  </Text>
                  <Badge color="cyan" variant="light" size="xs" radius="sm">
                    دمو
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed" lh={1.4}>
                  مرکز فرمان اهدای خون
                </Text>
              </Box>
            </Group>

            <ScrollArea className="min-h-0 flex-1" type="hover" scrollbarSize={6}>
              <Stack gap="lg" pe={4}>
                {NAV_GROUPS.map((group) => (
                  <Stack key={group.title} gap={4}>
                    <Text
                      size="xs"
                      fw={700}
                      c="dimmed"
                      px={8}
                      tt="uppercase"
                      style={{ letterSpacing: '0.08em' }}
                    >
                      {group.title}
                    </Text>
                    {group.items.map((item) => {
                      const active = isActivePath(pathname, item.to);
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="bn-nav-link"
                          data-active={active}
                          aria-current={active ? 'page' : undefined}
                          onClick={close}
                        >
                          <span className="bn-nav-icon">
                            <IconComponent size={19} weight={active ? 'fill' : 'duotone'} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate">{item.label}</span>
                            <span className="block truncate text-[0.7rem] font-normal text-[var(--bn-muted)]">
                              {item.description}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </Stack>
                ))}
              </Stack>
            </ScrollArea>
          </Stack>

          <Stack gap="sm">
            <Divider color="var(--bn-border)" />
            <Box
              p="sm"
              className="rounded-xl border border-[#D8EAE6] bg-[#F7FBFA]"
            >
              <Group gap="xs" wrap="nowrap">
                <ThemeIcon size={30} radius="xl" variant="light" color="green" aria-hidden="true">
                  <ShieldCheck size={17} weight="fill" />
                </ThemeIcon>
                <Box className="min-w-0">
                  <Text size="xs" fw={700} lh={1.4}>
                    حالت نمایشی محلی
                  </Text>
                  <Text size="xs" c="dimmed" lh={1.4}>
                    بدون اتصال به Backend
                  </Text>
                </Box>
              </Group>
              <Text size="xs" c="dimmed" mt={8} lh={1.65}>
                داده‌ها ساختگی‌اند و مبنای تصمیم پزشکی نیستند.
              </Text>
            </Box>
            <Group justify="space-between" px={2}>
              <Text size="xs" c="dimmed">
                BloodNet v0.1
              </Text>
              <Group gap={4}>
                <Sparkle size={12} color="#0F766E" aria-hidden="true" />
                <Text size="xs" c="dimmed">
                  RTL / فارسی
                </Text>
              </Group>
            </Group>
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main className="bn-app-bg">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <DemoBanner />
          <Outlet />
          <Group
            justify="space-between"
            gap="sm"
            mt="xl"
            pt="md"
            style={{ borderTop: '1px solid var(--bn-border)' }}
          >
            <Group gap={6}>
              <FirstAidKit size={15} color="#0F766E" aria-hidden="true" />
              <Text size="xs" c="dimmed">
                BloodNet — هماهنگی اهدای خون
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              نسخه نمایشی · {formatDateTime(state.sim_time)}
            </Text>
          </Group>
        </div>
      </AppShell.Main>

      <Modal
        opened={resetOpen}
        onClose={resetModal.close}
        title="بازنشانی داده نمایشی"
        centered
      >
        <Text size="sm" lh={1.8}>
          همه درخواست‌ها، موجودی، دعوت‌ها و رویدادهای ثبت‌شده در این مرورگر به حالت
          اولیه برمی‌گردند. این عملیات فقط روی داده نمایشی اثر دارد.
        </Text>
        <Group justify="flex-end" gap="sm" mt="lg">
          <Button variant="default" onClick={resetModal.close}>
            انصراف
          </Button>
          <Button color="crimson" leftSection={<ArrowsClockwise size={16} />} onClick={handleReset}>
            بازنشانی کن
          </Button>
        </Group>
      </Modal>
    </AppShell>
  );
}
