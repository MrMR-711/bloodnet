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
    title: 'Ø¹Ù…Ù„ÛŒØ§Øª',
    items: [
      { to: '/', label: 'Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯', description: 'Ù†Ù…Ø§ÛŒ Ú©Ù„ÛŒ Ø´Ø¨Ú©Ù‡', icon: House },
      { to: '/requests', label: 'Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§', description: 'Ù¾ÛŒÚ¯ÛŒØ±ÛŒ ØªØ£Ù…ÛŒÙ†', icon: ClipboardText },
      { to: '/requests/new', label: 'Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª', description: 'Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¬Ø¯ÛŒØ¯', icon: Plus },
      { to: '/inventory', label: 'Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ù…Ø±Ø§Ú©Ø²', description: 'FEFO Ùˆ ØªØ®ØµÛŒØµ', icon: Drop },
      { to: '/donor', label: 'Ù¾ÙˆØ±ØªØ§Ù„ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡', description: 'Ø¯Ø¹ÙˆØª Ùˆ Ù¾ÛŒØ´Ø±ÙØª', icon: UsersThree },
    ],
  },
  {
    title: 'Ø´ÙØ§ÙÛŒØª',
    items: [
      { to: '/audit', label: 'Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§', description: 'Audit Trail', icon: ListBullets },
      { to: '/guide', label: 'Ø±Ø§Ù‡Ù†Ù…Ø§', description: 'Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ùˆ Ø§Ø¬Ø±Ø§', icon: BookOpen },
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
  if (pathname === '/') return { title: 'Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯ Ø¹Ù…Ù„ÛŒØ§Øª', subtitle: 'Ù†Ù…Ø§ÛŒ Ú©Ù„ÛŒ Ø´Ø¨Ú©Ù‡ Ø§Ù‡Ø¯Ø§ÛŒ Ø®ÙˆÙ†' };
  if (pathname === '/requests') return { title: 'Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§', subtitle: 'Ú†Ø±Ø®Ù‡ ØªØ£Ù…ÛŒÙ† Ùˆ ÙˆØ¶Ø¹ÛŒØª Ø±Ø³Ù…ÛŒ' };
  if (pathname === '/requests/new') return { title: 'Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª', subtitle: 'Ø§ÛŒØ¬Ø§Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¬Ø¯ÛŒØ¯' };
  if (pathname.startsWith('/requests/')) {
    return { title: 'Ø¬Ø²Ø¦ÛŒØ§Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª', subtitle: pathname.replace('/requests/', '') };
  }
  if (pathname === '/inventory') return { title: 'Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ù…Ø±Ø§Ú©Ø²', subtitle: 'FEFO Ùˆ ØªØ®ØµÛŒØµ Ø§ØªÙ…ÛŒ' };
  if (pathname === '/donor') return { title: 'Ù¾ÙˆØ±ØªØ§Ù„ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡', subtitle: 'Ø¯Ø¹ÙˆØªØŒ Ù…Ø³ÛŒØ± Ùˆ Ø§Ù‡Ø¯Ø§' };
  if (pathname === '/audit') return { title: 'Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§', subtitle: 'Ø±Ø¯Ù¾Ø§ÛŒ ØªØºÛŒÛŒØ±Ø§Øª Ùˆ CallbackÙ‡Ø§' };
  if (pathname === '/guide') return { title: 'Ø±Ø§Ù‡Ù†Ù…Ø§', subtitle: 'Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ØŒ Ø§Ø¬Ø±Ø§ Ùˆ Ù…Ø­Ø¯ÙˆØ¯ÛŒØªâ€ŒÙ‡Ø§' };
  return { title: 'BloodNet', subtitle: 'Ù…Ø±Ú©Ø² ÙØ±Ù…Ø§Ù† Ø§Ù‡Ø¯Ø§ÛŒ Ø®ÙˆÙ†' };
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
    document.title = `${meta.title} Â· BloodNet`;
  }, [meta.title]);

  const handleReset = () => {
    resetDemo();
    resetModal.close();
    notifications.show({
      title: 'Ø¯Ø§Ø¯Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ Ø¨Ø§Ø²Ù†Ø´Ø§Ù†ÛŒ Ø´Ø¯',
      message: 'Ù‡Ù…Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ØŒ Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ùˆ Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§ Ø¨Ù‡ Ø­Ø§Ù„Øª Ø§ÙˆÙ„ÛŒÙ‡ Ø¨Ø±Ú¯Ø´ØªÙ†Ø¯.',
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
              aria-label="Ø¨Ø§Ø² Ú©Ø±Ø¯Ù† Ù…Ù†ÙˆÛŒ Ø§ØµÙ„ÛŒ"
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
            <Tooltip label="Ø³Ø§Ø¹Øª Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒ Ø§Ø² Gateway">
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
                  aria-label="Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§"
                >
                  <Indicator color="crimson" size={8} offset={4} processing>
                    <Bell size={19} weight="duotone" />
                  </Indicator>
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Ø§Ø¹Ù„Ø§Ù†â€ŒÙ‡Ø§ÛŒ Ù†Ù…Ø§ÛŒØ´ÛŒ</Menu.Label>
                <Menu.Item
                  leftSection={<Heartbeat size={17} color="#C2413A" />}
                  component={Link}
                  to="/requests/REQ-2027-0101"
                >
                  <Text size="sm" fw={600}>Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨Ø­Ø±Ø§Ù†ÛŒ O+</Text>
                  <Text size="xs" c="dimmed">Ø¨ÛŒÙ…Ø§Ø±Ø³ØªØ§Ù† Ø§Ù…Ø§Ù… Ø±Ø¶Ø§ â€” Û¶ ÙˆØ§Ø­Ø¯</Text>
                </Menu.Item>
                <Menu.Item
                  leftSection={<Info size={17} color="#be123c" />}
                  component={Link}
                  to="/inventory"
                >
                  <Text size="sm" fw={600}>Ù‡Ø´Ø¯Ø§Ø± Ø§Ù†Ù‚Ø¶Ø§ÛŒ Ù…ÙˆØ¬ÙˆØ¯ÛŒ</Text>
                  <Text size="xs" c="dimmed">Û² Ø±Ø¯ÛŒÙ Ú©Ù…ØªØ± Ø§Ø² Û¶ Ø³Ø§Ø¹Øª</Text>
                </Menu.Item>
                <Menu.Item
                  leftSection={<UsersThree size={17} color="#b91c1c" />}
                  component={Link}
                  to="/donor"
                >
                  <Text size="sm" fw={600}>Ø¯Ø¹ÙˆØªâ€ŒÙ‡Ø§ÛŒ Ø¯Ø± Ø§Ù†ØªØ¸Ø§Ø± Ù¾Ø§Ø³Ø®</Text>
                  <Text size="xs" c="dimmed">Û² Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡</Text>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu shadow="md" width={250} position="bottom-end" radius="md">
              <Menu.Target>
                <UnstyledButton
                  className="rounded-xl px-2 py-1 transition-colors hover:bg-[#fff1f1]"
                  aria-label="Ù…Ù†ÙˆÛŒ Ú©Ø§Ø±Ø¨Ø±"
                >
                  <Group gap="xs" wrap="nowrap">
                    <Avatar color="brand" radius="xl" size={34}>
                      {initials('Ù…Ø¯ÛŒØ± Ø´Ø¨Ú©Ù‡')}
                    </Avatar>
                    <Box visibleFrom="sm" className="text-start">
                      <Text size="xs" fw={700} lh={1.25}>Ù…Ø¯ÛŒØ± Ø´Ø¨Ú©Ù‡</Text>
                      <Text size="xs" c="dimmed" lh={1.25}>Ø¯Ø³ØªØ±Ø³ÛŒ Ù‡Ù…Ø§Ù‡Ù†Ú¯â€ŒÚ©Ù†Ù†Ø¯Ù‡</Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Ø­Ø³Ø§Ø¨ Ù†Ù…Ø§ÛŒØ´ÛŒ</Menu.Label>
                <Menu.Item leftSection={<Gear size={16} />} disabled>
                  ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ù†Ù‚Ø´
                </Menu.Item>
                <Menu.Item leftSection={<BookOpen size={16} />} component={Link} to="/guide">
                  Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ø§Ø¬Ø±Ø§ Ùˆ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<ArrowsClockwise size={16} />}
                  onClick={resetModal.open}
                >
                  Ø¨Ø§Ø²Ù†Ø´Ø§Ù†ÛŒ Ø¯Ø§Ø¯Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ
                </Menu.Item>
                <Menu.Item leftSection={<SignOut size={16} />} disabled>
                  Ø®Ø±ÙˆØ¬ (Ø¯Ø± Ø¯Ù…Ùˆ ØºÛŒØ±ÙØ¹Ø§Ù„)
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
              <Box className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7f1d1d] shadow-sm">
                <BrandMark size={30} />
              </Box>
              <Box className="min-w-0">
                <Group gap={6} wrap="nowrap">
                  <Text fw={800} fz="lg" lh={1.2} className="bn-gradient-text">
                    BloodNet
                  </Text>
                  <Badge color="cyan" variant="light" size="xs" radius="sm">
                    Ø¯Ù…Ùˆ
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed" lh={1.4}>
                  Ù…Ø±Ú©Ø² ÙØ±Ù…Ø§Ù† Ø§Ù‡Ø¯Ø§ÛŒ Ø®ÙˆÙ†
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
                    Ø­Ø§Ù„Øª Ù†Ù…Ø§ÛŒØ´ÛŒ Ù…Ø­Ù„ÛŒ
                  </Text>
                  <Text size="xs" c="dimmed" lh={1.4}>
                    Ø¨Ø¯ÙˆÙ† Ø§ØªØµØ§Ù„ Ø¨Ù‡ Backend
                  </Text>
                </Box>
              </Group>
              <Text size="xs" c="dimmed" mt={8} lh={1.65}>
                Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ Ø³Ø§Ø®ØªÚ¯ÛŒâ€ŒØ§Ù†Ø¯ Ùˆ Ù…Ø¨Ù†Ø§ÛŒ ØªØµÙ…ÛŒÙ… Ù¾Ø²Ø´Ú©ÛŒ Ù†ÛŒØ³ØªÙ†Ø¯.
              </Text>
            </Box>
            <Group justify="space-between" px={2}>
              <Text size="xs" c="dimmed">
                BloodNet v0.1
              </Text>
              <Group gap={4}>
                <Sparkle size={12} color="#b91c1c" aria-hidden="true" />
                <Text size="xs" c="dimmed">
                  RTL / ÙØ§Ø±Ø³ÛŒ
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
              <FirstAidKit size={15} color="#b91c1c" aria-hidden="true" />
              <Text size="xs" c="dimmed">
                BloodNet â€” Ù‡Ù…Ø§Ù‡Ù†Ú¯ÛŒ Ø§Ù‡Ø¯Ø§ÛŒ Ø®ÙˆÙ†
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Ù†Ø³Ø®Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ Â· {formatDateTime(state.sim_time)}
            </Text>
          </Group>
        </div>
      </AppShell.Main>

      <Modal
        opened={resetOpen}
        onClose={resetModal.close}
        title="Ø¨Ø§Ø²Ù†Ø´Ø§Ù†ÛŒ Ø¯Ø§Ø¯Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ"
        centered
      >
        <Text size="sm" lh={1.8}>
          Ù‡Ù…Ù‡ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ØŒ Ù…ÙˆØ¬ÙˆØ¯ÛŒØŒ Ø¯Ø¹ÙˆØªâ€ŒÙ‡Ø§ Ùˆ Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§ÛŒ Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡ Ø¯Ø± Ø§ÛŒÙ† Ù…Ø±ÙˆØ±Ú¯Ø± Ø¨Ù‡ Ø­Ø§Ù„Øª
          Ø§ÙˆÙ„ÛŒÙ‡ Ø¨Ø±Ù…ÛŒâ€ŒÚ¯Ø±Ø¯Ù†Ø¯. Ø§ÛŒÙ† Ø¹Ù…Ù„ÛŒØ§Øª ÙÙ‚Ø· Ø±ÙˆÛŒ Ø¯Ø§Ø¯Ù‡ Ù†Ù…Ø§ÛŒØ´ÛŒ Ø§Ø«Ø± Ø¯Ø§Ø±Ø¯.
        </Text>
        <Group justify="flex-end" gap="sm" mt="lg">
          <Button variant="default" onClick={resetModal.close}>
            Ø§Ù†ØµØ±Ø§Ù
          </Button>
          <Button color="crimson" leftSection={<ArrowsClockwise size={16} />} onClick={handleReset}>
            Ø¨Ø§Ø²Ù†Ø´Ø§Ù†ÛŒ Ú©Ù†
          </Button>
        </Group>
      </Modal>
    </AppShell>
  );
}

