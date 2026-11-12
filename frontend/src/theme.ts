import { createTheme, rem, type MantineColorsTuple } from '@mantine/core';

const brand: MantineColorsTuple = [
  '#FFF1F1',
  '#FFE0E0',
  '#FFC7C7',
  '#FFA3A3',
  '#F87171',
  '#EF4444',
  '#DC2626',
  '#B91C1C',
  '#991B1B',
  '#7F1D1D',
];

const crimson: MantineColorsTuple = [
  '#FFF1F0',
  '#FFD9D6',
  '#FFB3AD',
  '#FF8A82',
  '#F2635B',
  '#D94B43',
  '#C2413A',
  '#9E2F2A',
  '#7C221E',
  '#5C1714',
];

const amber: MantineColorsTuple = [
  '#FFF8E6',
  '#FFEDC2',
  '#FFE09A',
  '#FFD16D',
  '#F7BE45',
  '#E7A92E',
  '#B45309',
  '#93420A',
  '#74330A',
  '#572509',
];

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: 7,
  fontFamily: 'Vazirmatn Variable, Vazirmatn, Tahoma, sans-serif',
  headings: {
    fontFamily: 'Vazirmatn Variable, Vazirmatn, Tahoma, sans-serif',
    fontWeight: '700',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  colors: {
    brand,
    crimson,
    amber,
  },
  fontSizes: {
    xs: rem(12),
    sm: rem(13),
    md: rem(15),
    lg: rem(17),
    xl: rem(20),
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
    },
    TextInput: {
      defaultProps: { radius: 'md' },
    },
    Select: {
      defaultProps: { radius: 'md' },
    },
    NumberInput: {
      defaultProps: { radius: 'md' },
    },
    Textarea: {
      defaultProps: { radius: 'md' },
    },
    Modal: {
      defaultProps: {
        centered: true,
        radius: 'lg',
      },
    },
    Table: {
      defaultProps: {
        highlightOnHover: true,
        verticalSpacing: 'sm',
        horizontalSpacing: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Tooltip: {
      defaultProps: {
        withArrow: true,
        openDelay: 250,
      },
    },
  },
});
