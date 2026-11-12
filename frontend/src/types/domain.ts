export const BLOOD_GROUPS = [
  'O+',
  'O-',
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const PRODUCTS = ['red_cells', 'platelets', 'plasma'] as const;
export type Product = (typeof PRODUCTS)[number];

export const URGENCIES = ['critical', 'urgent', 'planned'] as const;
export type Urgency = (typeof URGENCIES)[number];

export const REQUEST_STATES = [
  'pending_review',
  'open',
  'mobilizing',
  'partially_fulfilled',
  'fulfilled',
  'cancelled',
  'expired',
] as const;
export type RequestState = (typeof REQUEST_STATES)[number];

export type DonorStatus =
  | 'invited'
  | 'accepted'
  | 'declined'
  | 'en_route'
  | 'arrived'
  | 'screen_pass'
  | 'screen_fail'
  | 'donated'
  | 'no_show';

export type DonorProgress = Exclude<DonorStatus, 'invited' | 'accepted' | 'declined'>;

export type GatewayStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'expired';

export type ActorRole = 'hospital' | 'center' | 'donor' | 'coordinator' | 'system';

export interface RequestCounters {
  needed: number;
  confirmed: number;
  en_route: number;
  arrived: number;
  fulfilled: number;
}

export interface RequestRecord {
  id: string;
  hospital_id: string;
  hospital_name: string;
  blood_group: BloodGroup;
  product: Product;
  units: number;
  urgency: Urgency;
  note: string;
  state: RequestState;
  created_at: string;
  updated_at: string;
  counters: RequestCounters;
  allocated_units: number;
  supplied_units: number;
  idempotency_key: string;
  last_event: string;
}

export interface InventoryItem {
  id: string;
  center_id: string;
  center_name: string;
  blood_group: BloodGroup;
  product: Product;
  units: number;
  /** دقیقه مطلق از Epoch شبیه‌سازی */
  expires_sim_min: number;
}

export interface DonorRecord {
  id: string;
  name: string;
  blood_group: BloodGroup;
  phone_masked: string;
  request_id: string;
  center_id: string;
  center_name: string;
  product: Product;
  status: DonorStatus;
  gateway_status: GatewayStatus;
  invited_at: string;
  updated_at: string;
}

export interface DispatchRecord {
  id: string;
  request_id: string;
  center_id: string;
  center_name: string;
  blood_group: BloodGroup;
  recipient_blood_group: BloodGroup;
  product: Product;
  units: number;
  status: GatewayStatus;
  eta_sim_min: number;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  actor_role: ActorRole;
  type: string;
  request_id: string | null;
  summary: string;
  effect: string;
  source: 'demo' | 'live';
}

export interface DemoState {
  version: 1;
  sim_time: string;
  requests: RequestRecord[];
  inventory: InventoryItem[];
  donors: DonorRecord[];
  dispatches: DispatchRecord[];
  audit: AuditEvent[];
}

export interface NewRequestInput {
  hospital_id: string;
  hospital_name: string;
  blood_group: BloodGroup;
  product: Product;
  units: number;
  urgency: Urgency;
  note: string;
}

export interface DispatchInput {
  item_id: string;
  request_id: string;
  units: number;
  dispatch_id: string;
}

export interface HospitalOption {
  id: string;
  name: string;
  city: string;
  travel_min: Record<string, number>;
}

export interface CenterOption {
  id: string;
  name: string;
  city: string;
}

export const SIM_EPOCH = '2027-01-15T00:00:00+03:30';

/**
 * ماتریس سازگاری رسمی کیت تمرین (fictional contest rules).
 * منبع: participant_kit/compat.yaml — این ماتریس تنها مرجع UI است.
 */
export const BLOOD_COMPATIBILITY: Record<
  Product,
  Record<BloodGroup, readonly BloodGroup[]>
> = {
  red_cells: {
    'O+': ['O+', 'O-'],
    'A+': ['O+', 'A+', 'O-', 'A-'],
    'B+': ['O+', 'B+', 'O-', 'B-'],
    'AB+': ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'],
    'O-': ['O-'],
    'A-': ['O-', 'A-'],
    'B-': ['O-', 'B-'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
  },
  platelets: {
    'O+': ['O+', 'O-'],
    'A+': ['A+', 'A-'],
    'B+': ['B+', 'B-'],
    'AB+': ['AB+', 'AB-'],
    'O-': ['O+', 'O-'],
    'A-': ['A+', 'A-'],
    'B-': ['B+', 'B-'],
    'AB-': ['AB+', 'AB-'],
  },
  plasma: {
    'O+': ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'],
    'A+': ['A+', 'AB+', 'A-', 'AB-'],
    'B+': ['B+', 'AB+', 'B-', 'AB-'],
    'AB+': ['AB+', 'AB-'],
    'O-': ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'],
    'A-': ['A+', 'AB+', 'A-', 'AB-'],
    'B-': ['B+', 'AB+', 'B-', 'AB-'],
    'AB-': ['AB+', 'AB-'],
  },
};

export function isCompatible(
  donor: BloodGroup,
  recipient: BloodGroup,
  product: Product,
): boolean {
  return BLOOD_COMPATIBILITY[product][recipient].includes(donor);
}

export function compatibleDonorGroups(
  recipient: BloodGroup,
  product: Product,
): readonly BloodGroup[] {
  return BLOOD_COMPATIBILITY[product][recipient];
}
