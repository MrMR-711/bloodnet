import type {
  AuditEvent,
  CenterOption,
  DemoState,
  DispatchRecord,
  DonorRecord,
  DonorStatus,
  HospitalOption,
  InventoryItem,
  RequestRecord,
} from '../types/domain';
import { PRODUCT_LABELS } from '../lib/labels';
import { addMinutes, isoFromSimMinute } from '../lib/format';

export const DEMO_START_SIM_MINUTE = 510;
export const DEMO_START_ISO = isoFromSimMinute(DEMO_START_SIM_MINUTE);

export const CENTERS: CenterOption[] = [
  { id: 'center-1', name: 'مرکز انتقال خون مشهد', city: 'مشهد' },
  { id: 'center-2', name: 'مرکز انتقال خون تهران', city: 'تهران' },
  { id: 'center-3', name: 'مرکز انتقال خون شیراز', city: 'شیراز' },
  { id: 'center-4', name: 'مرکز انتقال خون اصفهان', city: 'اصفهان' },
  { id: 'center-5', name: 'مرکز انتقال خون تبریز', city: 'تبریز' },
];

export const HOSPITALS: HospitalOption[] = [
  {
    id: 'hosp-1',
    name: 'بیمارستان امام رضا',
    city: 'مشهد',
    travel_min: { 'center-1': 18, 'center-2': 740, 'center-3': 900, 'center-4': 1000, 'center-5': 1200 },
  },
  {
    id: 'hosp-2',
    name: 'بیمارستان شهید رجایی',
    city: 'تهران',
    travel_min: { 'center-1': 740, 'center-2': 22, 'center-3': 700, 'center-4': 340, 'center-5': 500 },
  },
  {
    id: 'hosp-3',
    name: 'بیمارستان نمازی',
    city: 'شیراز',
    travel_min: { 'center-1': 900, 'center-2': 700, 'center-3': 20, 'center-4': 320, 'center-5': 1000 },
  },
  {
    id: 'hosp-4',
    name: 'بیمارستان الزهرا',
    city: 'اصفهان',
    travel_min: { 'center-1': 1000, 'center-2': 340, 'center-3': 320, 'center-4': 25, 'center-5': 700 },
  },
  {
    id: 'hosp-5',
    name: 'بیمارستان کودکان مفید',
    city: 'تهران',
    travel_min: { 'center-1': 760, 'center-2': 30, 'center-3': 710, 'center-4': 350, 'center-5': 510 },
  },
];

export function hospitalById(id: string): HospitalOption | undefined {
  return HOSPITALS.find((hospital) => hospital.id === id);
}

export function centerById(id: string): CenterOption | undefined {
  return CENTERS.find((center) => center.id === id);
}

export function centerName(id: string): string {
  return centerById(id)?.name ?? id;
}

const NOW = DEMO_START_SIM_MINUTE;
const at = (minutesAgo: number) => isoFromSimMinute(NOW - minutesAgo);

const REQUESTS: RequestRecord[] = [
  {
    id: 'REQ-2027-0101',
    hospital_id: 'hosp-1',
    hospital_name: 'بیمارستان امام رضا',
    blood_group: 'O+',
    product: 'red_cells',
    units: 6,
    urgency: 'critical',
    note: 'بخش اورژانس — نیاز فوری به گلبول قرمز برای دو بیمار تصادف.',
    state: 'mobilizing',
    created_at: at(180),
    updated_at: at(12),
    counters: { needed: 6, confirmed: 4, en_route: 2, arrived: 1, fulfilled: 2 },
    allocated_units: 4,
    supplied_units: 2,
    idempotency_key: '9f4c0f6a-8f5c-4f0e-9d2a-6d7b2a1c0101',
    last_event: 'اهداکننده سارا احمدی به مرکز رسید.',
  },
  {
    id: 'REQ-2027-0102',
    hospital_id: 'hosp-2',
    hospital_name: 'بیمارستان شهید رجایی',
    blood_group: 'A-',
    product: 'platelets',
    units: 4,
    urgency: 'urgent',
    note: 'بخش خون — پلاکت برای بیمار تحت شیمی‌درمانی.',
    state: 'open',
    created_at: at(90),
    updated_at: at(40),
    counters: { needed: 4, confirmed: 1, en_route: 0, arrived: 0, fulfilled: 0 },
    allocated_units: 0,
    supplied_units: 0,
    idempotency_key: '9f4c0f6a-8f5c-4f0e-9d2a-6d7b2a1c0102',
    last_event: 'درخواست توسط هماهنگ‌کننده شبکه تأیید شد.',
  },
  {
    id: 'REQ-2027-0103',
    hospital_id: 'hosp-3',
    hospital_name: 'بیمارستان نمازی',
    blood_group: 'AB+',
    product: 'plasma',
    units: 8,
    urgency: 'planned',
    note: 'بخش جراحی — پلاسما برای جراحی برنامه‌ریزی‌شده فردا.',
    state: 'partially_fulfilled',
    created_at: at(600),
    updated_at: at(30),
    counters: { needed: 8, confirmed: 5, en_route: 3, arrived: 2, fulfilled: 3 },
    allocated_units: 3,
    supplied_units: 3,
    idempotency_key: '9f4c0f6a-8f5c-4f0e-9d2a-6d7b2a1c0103',
    last_event: 'سه واحد پلاسما به‌صورت اهدای واقعی ثبت شد.',
  },
  {
    id: 'REQ-2027-0104',
    hospital_id: 'hosp-4',
    hospital_name: 'بیمارستان الزهرا',
    blood_group: 'B+',
    product: 'red_cells',
    units: 3,
    urgency: 'urgent',
    note: 'بخش داخلی — درخواست تازه، منتظر تأیید هماهنگ‌کننده.',
    state: 'pending_review',
    created_at: at(20),
    updated_at: at(20),
    counters: { needed: 3, confirmed: 0, en_route: 0, arrived: 0, fulfilled: 0 },
    allocated_units: 0,
    supplied_units: 0,
    idempotency_key: '9f4c0f6a-8f5c-4f0e-9d2a-6d7b2a1c0104',
    last_event: 'درخواست ثبت شد و در صف بررسی است.',
  },
  {
    id: 'REQ-2027-0105',
    hospital_id: 'hosp-5',
    hospital_name: 'بیمارستان کودکان مفید',
    blood_group: 'O-',
    product: 'red_cells',
    units: 2,
    urgency: 'critical',
    note: 'بخش کودکان — تأمین کامل شد.',
    state: 'fulfilled',
    created_at: at(1440),
    updated_at: at(10),
    counters: { needed: 2, confirmed: 2, en_route: 1, arrived: 1, fulfilled: 2 },
    allocated_units: 2,
    supplied_units: 2,
    idempotency_key: '9f4c0f6a-8f5c-4f0e-9d2a-6d7b2a1c0105',
    last_event: 'آخرین واحد اهدایی ثبت و درخواست کامل شد.',
  },
  {
    id: 'REQ-2027-0106',
    hospital_id: 'hosp-2',
    hospital_name: 'بیمارستان شهید رجایی',
    blood_group: 'A+',
    product: 'platelets',
    units: 5,
    urgency: 'planned',
    note: 'درخواست آزمایشی که توسط بیمارستان لغو شد.',
    state: 'cancelled',
    created_at: at(2000),
    updated_at: at(110),
    counters: { needed: 5, confirmed: 0, en_route: 0, arrived: 0, fulfilled: 0 },
    allocated_units: 0,
    supplied_units: 0,
    idempotency_key: '9f4c0f6a-8f5c-4f0e-9d2a-6d7b2a1c0106',
    last_event: 'درخواست توسط بیمارستان لغو شد.',
  },
  {
    id: 'REQ-2027-0107',
    hospital_id: 'hosp-1',
    hospital_name: 'بیمارستان امام رضا',
    blood_group: 'AB-',
    product: 'plasma',
    units: 4,
    urgency: 'urgent',
    note: 'درخواست قدیمی که بدون تأمین کامل منقضی شد.',
    state: 'expired',
    created_at: at(5000),
    updated_at: at(310),
    counters: { needed: 4, confirmed: 0, en_route: 0, arrived: 0, fulfilled: 0 },
    allocated_units: 0,
    supplied_units: 0,
    idempotency_key: '9f4c0f6a-8f5c-4f0e-9d2a-6d7b2a1c0107',
    last_event: 'مهلت درخواست بدون تأمین کامل پایان یافت.',
  },
  {
    id: 'REQ-2027-0108',
    hospital_id: 'hosp-3',
    hospital_name: 'بیمارستان نمازی',
    blood_group: 'B-',
    product: 'red_cells',
    units: 6,
    urgency: 'critical',
    note: 'بخش اورژانس — یک اهداکننده در مسیر مرکز است.',
    state: 'open',
    created_at: at(45),
    updated_at: at(15),
    counters: { needed: 6, confirmed: 1, en_route: 1, arrived: 0, fulfilled: 0 },
    allocated_units: 0,
    supplied_units: 0,
    idempotency_key: '9f4c0f6a-8f5c-4f0e-9d2a-6d7b2a1c0108',
    last_event: 'لیلا رحیمی به سمت مرکز انتقال خون شیراز حرکت کرد.',
  },
];

const inventory = (
  id: string,
  centerId: string,
  bloodGroup: InventoryItem['blood_group'],
  product: InventoryItem['product'],
  units: number,
  expiresInMinutes: number,
): InventoryItem => ({
  id,
  center_id: centerId,
  center_name: centerName(centerId),
  blood_group: bloodGroup,
  product,
  units,
  expires_sim_min: NOW + expiresInMinutes,
});

const INVENTORY: InventoryItem[] = [
  inventory('INV-1001', 'center-1', 'O+', 'red_cells', 8, 480),
  inventory('INV-1002', 'center-1', 'O-', 'red_cells', 3, 200),
  inventory('INV-1003', 'center-1', 'A+', 'red_cells', 6, 1500),
  inventory('INV-1004', 'center-1', 'B+', 'red_cells', 5, 2400),
  inventory('INV-1005', 'center-1', 'AB+', 'plasma', 4, 900),
  inventory('INV-1006', 'center-1', 'A-', 'platelets', 2, 180),
  inventory('INV-1007', 'center-1', 'O+', 'platelets', 4, 240),
  inventory('INV-1008', 'center-1', 'B-', 'red_cells', 2, 3000),
  inventory('INV-1009', 'center-2', 'O+', 'red_cells', 12, 720),
  inventory('INV-1010', 'center-2', 'A-', 'red_cells', 5, 1000),
  inventory('INV-1011', 'center-2', 'A+', 'platelets', 6, 360),
  inventory('INV-1012', 'center-2', 'B+', 'platelets', 3, 600),
  inventory('INV-1013', 'center-2', 'AB-', 'plasma', 2, 1440),
  inventory('INV-1014', 'center-2', 'O-', 'red_cells', 4, 90),
  inventory('INV-1015', 'center-2', 'AB+', 'red_cells', 4, 2000),
  inventory('INV-1016', 'center-3', 'AB+', 'plasma', 10, 1200),
  inventory('INV-1017', 'center-3', 'A+', 'plasma', 6, 2000),
  inventory('INV-1018', 'center-3', 'B+', 'plasma', 4, 3000),
  inventory('INV-1019', 'center-3', 'O+', 'red_cells', 7, 900),
  inventory('INV-1020', 'center-3', 'B-', 'platelets', 2, 480),
  inventory('INV-1021', 'center-3', 'A-', 'plasma', 3, 600),
  inventory('INV-1022', 'center-4', 'B+', 'red_cells', 9, 1100),
  inventory('INV-1023', 'center-4', 'O-', 'red_cells', 2, 400),
  inventory('INV-1024', 'center-4', 'A+', 'red_cells', 5, 1600),
  inventory('INV-1025', 'center-4', 'AB-', 'red_cells', 3, 2500),
  inventory('INV-1026', 'center-4', 'O+', 'plasma', 8, 720),
  inventory('INV-1027', 'center-5', 'A-', 'red_cells', 4, 800),
  inventory('INV-1028', 'center-5', 'B-', 'red_cells', 3, 1300),
  inventory('INV-1029', 'center-5', 'AB+', 'platelets', 3, 240),
  inventory('INV-1030', 'center-5', 'O+', 'platelets', 8, 300),
  inventory('INV-1031', 'center-5', 'A+', 'plasma', 5, 1800),
  inventory('INV-1032', 'center-5', 'O-', 'plasma', 6, 1000),
];

const donor = (
  id: string,
  name: string,
  bloodGroup: DonorRecord['blood_group'],
  requestId: string,
  centerId: string,
  product: DonorRecord['product'],
  status: DonorStatus,
  gatewayStatus: DonorRecord['gateway_status'],
  invitedAt: string,
  updatedAt: string,
  phoneMasked: string,
): DonorRecord => ({
  id,
  name,
  blood_group: bloodGroup,
  phone_masked: phoneMasked,
  request_id: requestId,
  center_id: centerId,
  center_name: centerName(centerId),
  product,
  status,
  gateway_status: gatewayStatus,
  invited_at: invitedAt,
  updated_at: updatedAt,
});

const DONORS: DonorRecord[] = [
  donor('DNR-1001', 'سارا احمدی', 'O+', 'REQ-2027-0101', 'center-1', 'red_cells', 'arrived', 'delivered', at(120), at(20), '۰۹۱۲***۴۵۶۷'),
  donor('DNR-1002', 'مهدی رضایی', 'O-', 'REQ-2027-0101', 'center-1', 'red_cells', 'donated', 'delivered', at(130), at(35), '۰۹۱۵***۸۲۱۰'),
  donor('DNR-1003', 'نگار موسوی', 'A-', 'REQ-2027-0102', 'center-2', 'platelets', 'accepted', 'sent', at(80), at(50), '۰۹۳۵***۳۳۱۲'),
  donor('DNR-1004', 'علی کریمی', 'AB+', 'REQ-2027-0103', 'center-3', 'plasma', 'screen_pass', 'delivered', at(210), at(25), '۰۹۱۷***۹۰۴۴'),
  donor('DNR-1005', 'زهرا حسینی', 'B-', 'REQ-2027-0108', 'center-5', 'red_cells', 'invited', 'queued', at(30), at(30), '۰۹۱۴***۷۷۲۱'),
  donor('DNR-1006', 'رضا شریفی', 'O-', 'REQ-2027-0105', 'center-1', 'red_cells', 'donated', 'delivered', at(1300), at(1000), '۰۹۱۵***۱۱۸۸'),
  donor('DNR-1007', 'مریم صادقی', 'A+', 'REQ-2027-0106', 'center-2', 'platelets', 'declined', 'delivered', at(1400), at(90), '۰۹۳۶***۵۴۰۹'),
  donor('DNR-1008', 'حسین نادری', 'O+', 'REQ-2027-0103', 'center-4', 'plasma', 'donated', 'delivered', at(260), at(40), '۰۹۱۳***۲۲۹۰'),
  donor('DNR-1009', 'امیر کاظمی', 'O+', 'REQ-2027-0101', 'center-1', 'red_cells', 'invited', 'sent', at(15), at(15), '۰۹۱۵***۶۶۰۳'),
  donor('DNR-1010', 'لیلا رحیمی', 'B-', 'REQ-2027-0108', 'center-3', 'red_cells', 'en_route', 'delivered', at(40), at(15), '۰۹۱۷***۴۴۱۹'),
];

const DISPATCHES: DispatchRecord[] = [
  {
    id: 'DSP-5001',
    request_id: 'REQ-2027-0101',
    center_id: 'center-1',
    center_name: centerName('center-1'),
    blood_group: 'O+',
    recipient_blood_group: 'O+',
    product: 'red_cells',
    units: 4,
    status: 'delivered',
    eta_sim_min: 28,
    created_at: at(60),
  },
  {
    id: 'DSP-5002',
    request_id: 'REQ-2027-0103',
    center_id: 'center-3',
    center_name: centerName('center-3'),
    blood_group: 'AB+',
    recipient_blood_group: 'AB+',
    product: 'plasma',
    units: 3,
    status: 'sent',
    eta_sim_min: 30,
    created_at: at(30),
  },
  {
    id: 'DSP-5003',
    request_id: 'REQ-2027-0105',
    center_id: 'center-1',
    center_name: centerName('center-1'),
    blood_group: 'O-',
    recipient_blood_group: 'O-',
    product: 'red_cells',
    units: 2,
    status: 'delivered',
    eta_sim_min: 28,
    created_at: at(850),
  },
];

const DONOR_SEQUENCE: Record<DonorStatus, DonorStatus[]> = {
  invited: [],
  accepted: ['accepted'],
  declined: ['declined'],
  en_route: ['accepted', 'en_route'],
  arrived: ['accepted', 'en_route', 'arrived'],
  screen_pass: ['accepted', 'en_route', 'arrived', 'screen_pass'],
  screen_fail: ['accepted', 'en_route', 'arrived', 'screen_fail'],
  donated: ['accepted', 'en_route', 'arrived', 'screen_pass', 'donated'],
  no_show: ['accepted', 'en_route', 'arrived', 'screen_pass', 'no_show'],
};

const DONOR_EVENT_COPY: Record<
  DonorStatus,
  { type: string; summary: string; effect: string }
> = {
  invited: { type: 'donor_invited', summary: 'دعوت اهدا ارسال شد.', effect: 'تأمین‌شده بدون تغییر' },
  accepted: {
    type: 'donor_accepted',
    summary: 'اهداکننده دعوت را پذیرفت.',
    effect: 'confirmed +۱؛ تأمین‌شده بدون تغییر',
  },
  declined: {
    type: 'donor_declined',
    summary: 'اهداکننده دعوت را رد کرد.',
    effect: 'تأمین‌شده بدون تغییر',
  },
  en_route: {
    type: 'donor_en_route',
    summary: 'اهداکننده به سمت مرکز حرکت کرد.',
    effect: 'en_route +۱؛ تأمین‌شده بدون تغییر',
  },
  arrived: {
    type: 'donor_arrived',
    summary: 'اهداکننده به مرکز رسید.',
    effect: 'arrived +۱؛ تأمین‌شده بدون تغییر',
  },
  screen_pass: {
    type: 'donor_screen_pass',
    summary: 'اهداکننده غربالگری اولیه را گذراند.',
    effect: 'صلاحیت اهدا تأیید شد؛ تأمین‌شده بدون تغییر',
  },
  screen_fail: {
    type: 'donor_screen_fail',
    summary: 'اهداکننده در غربالگری رد شد.',
    effect: 'اهدا انجام نشد؛ تأمین‌شده بدون تغییر',
  },
  donated: {
    type: 'donor_donated',
    summary: 'اهدای واقعی ثبت شد.',
    effect: 'supplied +۱ و fulfilled +۱',
  },
  no_show: {
    type: 'donor_no_show',
    summary: 'اهداکننده مراجعه نکرد.',
    effect: 'تأمین‌شده بدون تغییر',
  },
};

function buildAudit(
  requests: RequestRecord[],
  donors: DonorRecord[],
  dispatches: DispatchRecord[],
): AuditEvent[] {
  const events: Omit<AuditEvent, 'id'>[] = [];

  for (const request of requests) {
    events.push({
      at: request.created_at,
      actor: request.hospital_name,
      actor_role: 'hospital',
      type: 'request_created',
      request_id: request.id,
      summary: `درخواست ${request.units} واحد ${PRODUCT_LABELS[request.product]} ثبت شد.`,
      effect: 'state=pending_review',
      source: 'demo',
    });

    if (request.state !== 'pending_review') {
      events.push({
        at: addMinutes(request.created_at, 12),
        actor: 'هماهنگ‌کننده شبکه',
        actor_role: 'coordinator',
        type: 'request_approved',
        request_id: request.id,
        summary: 'درخواست تأیید و وارد چرخه تأمین شد.',
        effect: 'state=open',
        source: 'demo',
      });
    }

    if (request.state === 'cancelled') {
      events.push({
        at: request.updated_at,
        actor: request.hospital_name,
        actor_role: 'hospital',
        type: 'request_cancelled',
        request_id: request.id,
        summary: 'درخواست توسط بیمارستان لغو شد.',
        effect: 'state=cancelled',
        source: 'demo',
      });
    }

    if (request.state === 'expired') {
      events.push({
        at: request.updated_at,
        actor: 'سیستم',
        actor_role: 'system',
        type: 'request_expired',
        request_id: request.id,
        summary: 'مهلت درخواست بدون تأمین کامل پایان یافت.',
        effect: 'state=expired',
        source: 'demo',
      });
    }

    if (request.state === 'partially_fulfilled' || request.state === 'fulfilled') {
      events.push({
        at: request.updated_at,
        actor: 'سیستم',
        actor_role: 'system',
        type: 'state_changed',
        request_id: request.id,
        summary:
          request.state === 'fulfilled'
            ? 'همه واحدهای درخواستی تأمین شد.'
            : 'بخشی از واحدهای درخواستی تأمین شد.',
        effect: `state=${request.state}`,
        source: 'demo',
      });
    }
  }

  for (const dispatch of dispatches) {
    events.push({
      at: dispatch.created_at,
      actor: dispatch.center_name,
      actor_role: 'center',
      type: 'dispatch_created',
      request_id: dispatch.request_id,
      summary: `${dispatch.units} واحد ${PRODUCT_LABELS[dispatch.product]} از ${dispatch.center_name} تخصیص یافت.`,
      effect: `allocated +${dispatch.units}؛ تأمین‌شده بدون تغییر`,
      source: 'demo',
    });
  }

  for (const donor of donors) {
    const request = requests.find((item) => item.id === donor.request_id);
    const requestLabel = request ? request.id : donor.request_id;
    const invitedCopy = DONOR_EVENT_COPY.invited;
    events.push({
      at: donor.invited_at,
      actor: 'سیستم دعوت',
      actor_role: 'system',
      type: invitedCopy.type,
      request_id: donor.request_id,
      summary: `${donor.name} برای درخواست ${requestLabel} دعوت شد.`,
      effect: invitedCopy.effect,
      source: 'demo',
    });

    const sequence = DONOR_SEQUENCE[donor.status];
    const start = new Date(donor.invited_at).getTime();
    const end = new Date(donor.updated_at).getTime();
    sequence.forEach((status, index) => {
      const copy = DONOR_EVENT_COPY[status];
      const eventAt =
        index === sequence.length - 1
          ? donor.updated_at
          : new Date(start + ((end - start) * (index + 1)) / sequence.length).toISOString();
      events.push({
        at: eventAt,
        actor: donor.name,
        actor_role: 'donor',
        type: copy.type,
        request_id: donor.request_id,
        summary: `${copy.summary} (${donor.id})`,
        effect: copy.effect,
        source: 'demo',
      });
    });
  }

  return events
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .map((event, index) => ({
      ...event,
      id: `EVT-${String(events.length - index).padStart(4, '0')}`,
    }));
}

export function createSeedState(): DemoState {
  return {
    version: 1,
    sim_time: DEMO_START_ISO,
    requests: REQUESTS,
    inventory: INVENTORY,
    donors: DONORS,
    dispatches: DISPATCHES,
    audit: buildAudit(REQUESTS, DONORS, DISPATCHES),
  };
}
