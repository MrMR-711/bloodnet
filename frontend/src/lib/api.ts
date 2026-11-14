import type {
  BloodGroup,
  DonorProgress,
  Product,
  Urgency,
} from '../types/domain';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
const HOSPITAL_TOKEN = import.meta.env.VITE_HOSPITAL_TOKEN ?? 'hospital-token';
const COORDINATOR_TOKEN = import.meta.env.VITE_COORDINATOR_TOKEN ?? 'coordinator-token';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface ApiRequest {
  request_id: string;
  status: string;
  needed: number;
  confirmed: number;
  en_route: number;
  arrived: number;
  fulfilled: number;
  units: number;
  allocated_units: number;
  supplied_units: number;
  remaining_units: number;
  hospital_id: string;
  hospital_name: string;
  blood_group: BloodGroup;
  product: Product;
  urgency: Urgency;
  note: string;
  created_sim: number;
  updated_sim: number;
  last_event: string;
}

export interface ApiDispatch {
  id: string;
  center_id: string;
  center_name: string;
  blood_group: BloodGroup;
  product: Product;
  units: number;
  eta_sim_min: number;
  status: string;
  created_sim: number;
}

export interface ApiRequestDetail extends ApiRequest {
  dispatches: ApiDispatch[];
  donors: Array<{
    donor_id: string;
    template: string;
    gateway_status: string;
    response: string;
    active: boolean;
    created_sim: number;
  }>;
  audit: Array<{
    id: string;
    sim_time: number;
    actor: string;
    actor_role: string;
    type: string;
    summary: string;
    effect: string;
  }>;
}

export interface ApiInventoryItem {
  center_id: string;
  blood_group: BloodGroup;
  product: Product;
  units: number;
  expires_at: string;
  expires_sim_min: number;
}

export interface ApiInventoryResponse {
  sim_time: number;
  items: ApiInventoryItem[];
}

export interface ApiCatalog {
  hospitals: Array<{ id: string; name: string; lat: number; lon: number }>;
  centers: Array<{ id: string; name: string; lat: number; lon: number }>;
  products: Product[];
  blood_groups: BloodGroup[];
}

export interface ApiDonor {
  donor_id: string;
  request_id: string;
  blood_group: BloodGroup;
  response: string;
  active: boolean;
  gateway_status: string;
  event?: string;
  created_sim: number;
  updated_sim: number;
}

export interface ApiAudit {
  id: string;
  sim_time: number;
  request_id: string | null;
  actor: string;
  actor_role: string;
  type: string;
  summary: string;
  effect: string;
}

async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
    idempotencyKey?: string;
    simTime?: number;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${options.token ?? HOSPITAL_TOKEN}`,
  };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
  if (options.simTime !== undefined) headers['X-Sim-Time'] = String(options.simTime);

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    let message = `درخواست API ناموفق بود (${response.status}).`;
    try {
      const payload = (await response.json()) as { detail?: unknown; message?: unknown };
      if (typeof payload.detail === 'string') message = payload.detail;
      else if (typeof payload.message === 'string') message = payload.message;
      else if (payload.detail && typeof payload.detail === 'object') {
        message = JSON.stringify(payload.detail);
      }
    } catch {
      // پاسخ غیر JSON را با پیام پیش‌فرض نشان می‌دهیم.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function getHealth(): Promise<{ ok: boolean }> {
  return request('/health');
}

export function getRequests(): Promise<{ items: ApiRequest[] }> {
  return request('/requests');
}

export function getRequestDetail(requestId: string): Promise<ApiRequestDetail> {
  return request(`/requests/${encodeURIComponent(requestId)}/detail`);
}

export function createRequest(
  input: {
    hospital_id: string;
    blood_group: BloodGroup;
    product: Product;
    units: number;
    urgency: Urgency;
    note: string;
  },
  idempotencyKey: string,
  simTime: number,
): Promise<ApiRequest> {
  return request('/requests', {
    method: 'POST',
    body: input,
    idempotencyKey,
    simTime,
  });
}

export function approveRequest(requestId: string, simTime: number): Promise<ApiRequest> {
  return request(`/requests/${encodeURIComponent(requestId)}/approve`, {
    method: 'POST',
    token: COORDINATOR_TOKEN,
    body: {},
    simTime,
  });
}

export function cancelRequest(requestId: string, simTime: number): Promise<ApiRequest> {
  return request(`/requests/${encodeURIComponent(requestId)}/cancel`, {
    method: 'POST',
    body: {},
    simTime,
  });
}

export function amendRequest(
  requestId: string,
  urgency: Urgency,
  simTime: number,
): Promise<ApiRequest> {
  return request(`/requests/${encodeURIComponent(requestId)}/amend`, {
    method: 'POST',
    body: { urgency },
    simTime,
  });
}

export function getInventory(): Promise<ApiInventoryResponse> {
  return request('/inventory');
}

export function dispatchInventory(payload: {
  dispatch_id: string;
  request_id: string;
  center_id: string;
  blood_group: BloodGroup;
  product: Product;
  units: number;
}, simTime: number): Promise<{ dispatch_id: string; units: number; eta_sim_min: number }> {
  return request('/inventory/dispatch', {
    method: 'POST',
    body: payload,
    simTime,
  });
}

export function getCatalog(): Promise<ApiCatalog> {
  return request('/catalog');
}

export function getAudit(): Promise<{ items: ApiAudit[] }> {
  return request('/audit');
}

export function getDonors(): Promise<{ items: ApiDonor[] }> {
  return request('/donors');
}

export function respondDonor(payload: {
  event_id: string;
  request_id: string;
  donor_id: string;
  response: 'accepted' | 'declined';
  sim_time: number;
}): Promise<unknown> {
  return request('/callbacks/donor-response', { method: 'POST', body: payload });
}

export function progressDonor(payload: {
  event_id: string;
  request_id: string;
  donor_id: string;
  event: DonorProgress;
  sim_time: number;
}): Promise<unknown> {
  return request('/callbacks/donor-progress', { method: 'POST', body: payload });
}
