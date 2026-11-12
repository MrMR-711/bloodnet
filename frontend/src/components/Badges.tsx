import { Badge } from '@mantine/core';
import {
  CalendarBlank,
  Clock,
  Drop,
  Flask,
  Siren,
  TestTube,
} from '@phosphor-icons/react';
import type {
  BloodGroup,
  DonorStatus,
  GatewayStatus,
  Product,
  RequestState,
  Urgency,
} from '../types/domain';
import {
  DONOR_STATUS_COLORS,
  DONOR_STATUS_LABELS,
  GATEWAY_STATUS_COLORS,
  GATEWAY_STATUS_LABELS,
  PRODUCT_COLORS,
  PRODUCT_LABELS,
  STATE_COLORS,
  STATE_LABELS,
  URGENCY_COLORS,
  URGENCY_LABELS,
} from '../lib/labels';

interface BadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function StateBadge({ state, size = 'sm' }: BadgeProps & { state: RequestState }) {
  return (
    <Badge color={STATE_COLORS[state]} variant="light" size={size} radius="sm">
      {STATE_LABELS[state]}
    </Badge>
  );
}

export function UrgencyBadge({ urgency, size = 'sm' }: BadgeProps & { urgency: Urgency }) {
  const icon =
    urgency === 'critical' ? (
      <Siren size={12} weight="fill" aria-hidden="true" />
    ) : urgency === 'urgent' ? (
      <Clock size={12} weight="bold" aria-hidden="true" />
    ) : (
      <CalendarBlank size={12} aria-hidden="true" />
    );

  return (
    <Badge
      color={URGENCY_COLORS[urgency]}
      variant={urgency === 'critical' ? 'filled' : 'light'}
      size={size}
      radius="sm"
      leftSection={icon}
    >
      {URGENCY_LABELS[urgency]}
    </Badge>
  );
}

export function ProductBadge({ product, size = 'sm' }: BadgeProps & { product: Product }) {
  const icon =
    product === 'red_cells' ? (
      <Drop size={12} weight="fill" aria-hidden="true" />
    ) : product === 'platelets' ? (
      <TestTube size={12} weight="bold" aria-hidden="true" />
    ) : (
      <Flask size={12} weight="bold" aria-hidden="true" />
    );

  return (
    <Badge
      color={PRODUCT_COLORS[product]}
      variant="light"
      size={size}
      radius="sm"
      leftSection={icon}
    >
      {PRODUCT_LABELS[product]}
    </Badge>
  );
}

export function BloodGroupBadge({ group, size = 'sm' }: BadgeProps & { group: BloodGroup }) {
  return (
    <Badge color="crimson" variant="outline" size={size} radius="sm">
      <span className="bn-ltr">{group}</span>
    </Badge>
  );
}

export function DonorStatusBadge({ status, size = 'sm' }: BadgeProps & { status: DonorStatus }) {
  return (
    <Badge color={DONOR_STATUS_COLORS[status]} variant="light" size={size} radius="sm">
      {DONOR_STATUS_LABELS[status]}
    </Badge>
  );
}

export function GatewayStatusBadge({
  status,
  size = 'xs',
}: BadgeProps & { status: GatewayStatus }) {
  return (
    <Badge color={GATEWAY_STATUS_COLORS[status]} variant="dot" size={size} radius="sm">
      {GATEWAY_STATUS_LABELS[status]}
    </Badge>
  );
}
