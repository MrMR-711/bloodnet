import { SIM_EPOCH } from '../types/domain';

export const SIM_EPOCH_MS = new Date(SIM_EPOCH).getTime();
const MINUTE_MS = 60_000;

const numberFormatter = new Intl.NumberFormat('fa-IR');
const dateTimeFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Tehran',
});
const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeZone: 'Asia/Tehran',
});
const timeFormatter = new Intl.DateTimeFormat('fa-IR', {
  timeStyle: 'short',
  timeZone: 'Asia/Tehran',
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatUnits(value: number): string {
  return `${formatNumber(value)} واحد`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return dateTimeFormatter.format(date);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return timeFormatter.format(date);
}

export function minutesBetween(fromIso: string, toIso: string): number {
  return Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / MINUTE_MS);
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * MINUTE_MS).toISOString();
}

export function simMinuteOf(iso: string): number {
  return Math.round((new Date(iso).getTime() - SIM_EPOCH_MS) / MINUTE_MS);
}

export function isoFromSimMinute(minute: number): string {
  return new Date(SIM_EPOCH_MS + minute * MINUTE_MS).toISOString();
}

export function formatDuration(minutes: number): string {
  const abs = Math.abs(Math.round(minutes));
  if (abs < 60) return `${formatNumber(abs)} دقیقه`;
  const hours = Math.floor(abs / 60);
  const remainder = abs % 60;
  if (hours < 24) {
    return remainder === 0
      ? `${formatNumber(hours)} ساعت`
      : `${formatNumber(hours)} ساعت و ${formatNumber(remainder)} دقیقه`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours === 0
    ? `${formatNumber(days)} روز`
    : `${formatNumber(days)} روز و ${formatNumber(remainingHours)} ساعت`;
}

export function formatRelative(iso: string, nowIso: string): string {
  const diff = minutesBetween(iso, nowIso);
  if (Math.abs(diff) < 1) return 'همین حالا';
  if (diff > 0) return `${formatDuration(diff)} پیش`;
  return `${formatDuration(diff)} دیگر`;
}

export function formatRemaining(iso: string, nowIso: string): string {
  const diff = minutesBetween(nowIso, iso);
  if (diff <= 0) return 'منقضی شده';
  return `${formatDuration(diff)} باقی‌مانده`;
}

export type ExpiryTone = 'expired' | 'critical' | 'warning' | 'healthy';

export function expiryTone(expiresAtIso: string, nowIso: string): ExpiryTone {
  const remaining = minutesBetween(nowIso, expiresAtIso);
  if (remaining <= 0) return 'expired';
  if (remaining < 360) return 'critical';
  if (remaining < 1440) return 'warning';
  return 'healthy';
}

export function expiryLabel(expiresAtIso: string, nowIso: string): string {
  const tone = expiryTone(expiresAtIso, nowIso);
  const remaining = minutesBetween(nowIso, expiresAtIso);
  if (tone === 'expired') return 'منقضی شده';
  if (tone === 'critical') return `کمتر از ۶ ساعت (${formatDuration(remaining)})`;
  if (tone === 'warning') return `کمتر از ۲۴ ساعت (${formatDuration(remaining)})`;
  return formatDuration(remaining);
}

export function formatPercent(value: number, total: number): string {
  if (total <= 0) return '۰٪';
  const percent = Math.round((value / total) * 100);
  return `${formatNumber(percent)}٪`;
}

export function clampPercent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

export function formatMaskedPhone(phone: string): string {
  return phone;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '؟';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}${parts[parts.length - 1][0]}`;
}
