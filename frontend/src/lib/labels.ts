import type {
  ActorRole,
  DonorStatus,
  GatewayStatus,
  Product,
  RequestState,
  Urgency,
} from '../types/domain';

export const STATE_LABELS: Record<RequestState, string> = {
  pending_review: 'در انتظار بررسی',
  open: 'باز',
  mobilizing: 'در حال بسیج',
  partially_fulfilled: 'تأمین جزئی',
  fulfilled: 'تأمین کامل',
  cancelled: 'لغو شده',
  expired: 'منقضی',
};

export const STATE_DESCRIPTIONS: Record<RequestState, string> = {
  pending_review: 'درخواست ثبت شده و منتظر تأیید هماهنگ‌کننده است.',
  open: 'درخواست تأیید شده و آماده جذب اهداکننده و تخصیص موجودی است.',
  mobilizing: 'برای این درخواست اهداکننده یا موجودی در حال حرکت است.',
  partially_fulfilled: 'بخشی از واحدهای درخواستی به‌صورت واقعی تأمین شده است.',
  fulfilled: 'همه واحدهای درخواستی تأمین شده‌اند.',
  cancelled: 'درخواست توسط بیمارستان لغو شده است.',
  expired: 'مهلت درخواست بدون تأمین کامل به پایان رسیده است.',
};

export const STATE_COLORS: Record<RequestState, string> = {
  pending_review: 'yellow',
  open: 'brand',
  mobilizing: 'cyan',
  partially_fulfilled: 'orange',
  fulfilled: 'green',
  cancelled: 'gray',
  expired: 'red',
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  critical: 'بحرانی',
  urgent: 'فوری',
  planned: 'برنامه‌ریزی‌شده',
};

export const URGENCY_COLORS: Record<Urgency, string> = {
  critical: 'red',
  urgent: 'orange',
  planned: 'blue',
};

export const URGENCY_SLA_MINUTES: Record<Urgency, number> = {
  critical: 90,
  urgent: 240,
  planned: 1440,
};

export const PRODUCT_LABELS: Record<Product, string> = {
  red_cells: 'گلبول قرمز',
  platelets: 'پلاکت',
  plasma: 'پلاسما',
};

export const PRODUCT_SHORT_LABELS: Record<Product, string> = {
  red_cells: 'RBC',
  platelets: 'PLT',
  plasma: 'FFP',
};

export const PRODUCT_COLORS: Record<Product, string> = {
  red_cells: 'red',
  platelets: 'orange',
  plasma: 'cyan',
};

export const DONOR_STATUS_LABELS: Record<DonorStatus, string> = {
  invited: 'دعوت‌شده',
  accepted: 'پذیرفته',
  declined: 'رد کرده',
  en_route: 'در مسیر',
  arrived: 'رسیده',
  screen_pass: 'قبول غربالگری',
  screen_fail: 'رد غربالگری',
  donated: 'اهدای ثبت‌شده',
  no_show: 'عدم مراجعه',
};

export const DONOR_STATUS_COLORS: Record<DonorStatus, string> = {
  invited: 'blue',
  accepted: 'brand',
  declined: 'gray',
  en_route: 'cyan',
  arrived: 'indigo',
  screen_pass: 'teal',
  screen_fail: 'red',
  donated: 'green',
  no_show: 'gray',
};

export const DONOR_TERMINAL_STATUSES: readonly DonorStatus[] = [
  'declined',
  'screen_fail',
  'donated',
  'no_show',
];

export const GATEWAY_STATUS_LABELS: Record<GatewayStatus, string> = {
  queued: 'در صف ارسال',
  sent: 'ارسال شده',
  delivered: 'تحویل شده',
  failed: 'ناموفق',
  expired: 'منقضی',
};

export const GATEWAY_STATUS_COLORS: Record<GatewayStatus, string> = {
  queued: 'gray',
  sent: 'blue',
  delivered: 'green',
  failed: 'red',
  expired: 'orange',
};

export const ACTOR_ROLE_LABELS: Record<ActorRole, string> = {
  hospital: 'بیمارستان',
  center: 'مرکز انتقال خون',
  donor: 'اهداکننده',
  coordinator: 'هماهنگ‌کننده شبکه',
  system: 'سیستم',
};

export const AUDIT_TYPE_LABELS: Record<string, string> = {
  request_created: 'ثبت درخواست',
  request_approved: 'تأیید درخواست',
  request_cancelled: 'لغو درخواست',
  request_amended: 'اصلاح فوریت',
  request_expired: 'انقضای درخواست',
  donor_invited: 'دعوت اهداکننده',
  donor_accepted: 'پذیرش دعوت',
  donor_declined: 'رد دعوت',
  donor_en_route: 'حرکت به مرکز',
  donor_arrived: 'رسیدن به مرکز',
  donor_screen_pass: 'قبولی غربالگری',
  donor_screen_fail: 'رد غربالگری',
  donor_donated: 'ثبت اهدا',
  donor_no_show: 'عدم مراجعه',
  dispatch_created: 'تخصیص موجودی',
  dispatch_failed: 'خطای تخصیص',
  gateway_status: 'وضعیت پیام',
  demo_reset: 'بازنشانی داده نمایشی',
  state_changed: 'تغییر وضعیت',
};

export function auditTypeLabel(type: string): string {
  return AUDIT_TYPE_LABELS[type] ?? type;
}


