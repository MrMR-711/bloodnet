import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ActorRole,
  AuditEvent,
  CenterOption,
  DemoState,
  DispatchInput,
  DispatchRecord,
  DonorProgress,
  DonorRecord,
  DonorStatus,
  GatewayStatus,
  HospitalOption,
  InventoryItem,
  NewRequestInput,
  RequestRecord,
  RequestState,
  Urgency,
} from '../types/domain';
import { isCompatible } from '../types/domain';
import { createSeedState, DEMO_START_ISO, CENTERS, HOSPITALS } from './seed';
import { addMinutes, isoFromSimMinute, minutesBetween, simMinuteOf } from '../lib/format';
import { createId, createIdempotencyKey } from '../lib/ids';
import { PRODUCT_LABELS } from '../lib/labels';
import {
  ApiError,
  amendRequest as apiAmendRequest,
  approveRequest as apiApproveRequest,
  cancelRequest as apiCancelRequest,
  createRequest as apiCreateRequest,
  dispatchInventory as apiDispatchInventory,
  getAudit,
  getCatalog,
  getDonors,
  getHealth,
  getInventory,
  getRequestDetail,
  getRequests,
  progressDonor as apiProgressDonor,
  respondDonor as apiRespondDonor,
  type ApiAudit,
  type ApiCatalog,
  type ApiDispatch,
  type ApiDonor,
  type ApiInventoryItem,
  type ApiRequest,
} from '../lib/api';

const STORAGE_KEY = 'bloodnet-demo-v1';

export class DemoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DemoError';
  }
}

export type StoreMode = 'live' | 'demo';

export interface DemoStoreValue {
  state: DemoState;
  mode: StoreMode;
  isLoading: boolean;
  error: string | null;
  hospitals: HospitalOption[];
  centers: CenterOption[];
  refresh: () => Promise<void>;
  createRequest: (input: NewRequestInput) => Promise<RequestRecord>;
  approveRequest: (requestId: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  amendRequest: (requestId: string, urgency: Urgency) => Promise<void>;
  dispatchInventory: (input: DispatchInput) => Promise<DispatchRecord>;
  respondDonor: (donorId: string, response: 'accepted' | 'declined') => Promise<void>;
  progressDonor: (donorId: string, progress: DonorProgress) => Promise<void>;
  resetDemo: () => Promise<void>;
}

function centerName(centers: CenterOption[], centerId: string): string {
  return centers.find((center) => center.id === centerId)?.name ?? centerId;
}

function mapRequest(item: ApiRequest): RequestRecord {
  return {
    id: item.request_id,
    hospital_id: item.hospital_id,
    hospital_name: item.hospital_name,
    blood_group: item.blood_group,
    product: item.product,
    units: item.units,
    urgency: item.urgency,
    note: item.note,
    state: item.status as RequestState,
    created_at: isoFromSimMinute(item.created_sim),
    updated_at: isoFromSimMinute(item.updated_sim),
    counters: {
      needed: item.needed,
      confirmed: item.confirmed,
      en_route: item.en_route,
      arrived: item.arrived,
      fulfilled: item.fulfilled,
    },
    allocated_units: item.allocated_units,
    supplied_units: item.supplied_units,
    idempotency_key: '',
    last_event: item.last_event,
  };
}

function mapDispatch(item: ApiDispatch, request: RequestRecord, centers: CenterOption[]): DispatchRecord {
  return {
    id: item.id,
    request_id: request.id,
    center_id: item.center_id,
    center_name: item.center_name || centerName(centers, item.center_id),
    blood_group: item.blood_group,
    recipient_blood_group: request.blood_group,
    product: item.product,
    units: item.units,
    status: item.status as GatewayStatus,
    eta_sim_min: item.eta_sim_min,
    created_at: isoFromSimMinute(item.created_sim),
  };
}

function mapAudit(item: ApiAudit): AuditEvent {
  return {
    id: item.id,
    at: isoFromSimMinute(item.sim_time),
    actor: item.actor,
    actor_role: item.actor_role as ActorRole,
    type: item.type,
    request_id: item.request_id,
    summary: item.summary,
    effect: item.effect,
    source: 'live',
  };
}

function donorStatus(item: ApiDonor): DonorStatus {
  if (item.event === 'donated') return 'donated';
  if (item.event === 'en_route') return 'en_route';
  if (item.event === 'arrived') return 'arrived';
  if (item.event === 'screen_pass') return 'screen_pass';
  if (item.event === 'screen_fail') return 'screen_fail';
  if (item.event === 'no_show') return 'no_show';
  if (item.response === 'accepted') return 'accepted';
  if (item.response === 'declined') return 'declined';
  return 'invited';
}

function mapDonor(
  item: ApiDonor,
  requests: RequestRecord[],
  dispatches: DispatchRecord[],
  centers: CenterOption[],
): DonorRecord {
  const request = requests.find((entry) => entry.id === item.request_id);
  const dispatch = dispatches.find((entry) => entry.request_id === item.request_id);
  const suffix = item.donor_id.replace(/[^0-9]/g, '').slice(-4) || item.donor_id.slice(-4);
  return {
    id: item.donor_id,
    name: `اهداکننده ${suffix}`,
    blood_group: item.blood_group,
    phone_masked: '۰۹••• ••• ••' + suffix.slice(-2),
    request_id: item.request_id,
    center_id: dispatch?.center_id ?? '',
    center_name: dispatch?.center_name ?? (dispatch ? centerName(centers, dispatch.center_id) : 'مرکز شبکه'),
    product: request?.product ?? 'red_cells',
    status: donorStatus(item),
    gateway_status: (item.gateway_status || 'sent') as GatewayStatus,
    invited_at: isoFromSimMinute(item.created_sim),
    updated_at: isoFromSimMinute(item.updated_sim),
  };
}

function toHospitals(catalog: ApiCatalog, centers: CenterOption[]): HospitalOption[] {
  const travel: Record<string, number> = {};
  centers.forEach((center) => {
    travel[center.id] = 30;
  });
  return catalog.hospitals.map((hospital) => ({
    id: hospital.id,
    name: hospital.name,
    city: '',
    travel_min: travel,
  }));
}

function toCenters(catalog: ApiCatalog): CenterOption[] {
  return catalog.centers.map((center) => ({
    id: center.id,
    name: center.name,
    city: '',
  }));
}

function mapInventory(item: ApiInventoryItem, centers: CenterOption[]): InventoryItem {
  return {
    id: `INV-${item.center_id}-${item.blood_group}-${item.product}-${item.expires_sim_min}`,
    center_id: item.center_id,
    center_name: centerName(centers, item.center_id),
    blood_group: item.blood_group,
    product: item.product,
    units: item.units,
    expires_sim_min: item.expires_sim_min,
  };
}

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

function isDemoState(value: unknown): value is DemoState {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<DemoState>;
  return (
    candidate.version === 1 &&
    typeof candidate.sim_time === 'string' &&
    Array.isArray(candidate.requests) &&
    Array.isArray(candidate.inventory) &&
    Array.isArray(candidate.donors) &&
    Array.isArray(candidate.dispatches) &&
    Array.isArray(candidate.audit)
  );
}

function loadState(): DemoState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed: unknown = JSON.parse(raw);
    return isDemoState(parsed) ? parsed : createSeedState();
  } catch {
    return createSeedState();
  }
}

function appendAudit(state: DemoState, event: Omit<AuditEvent, 'id' | 'source'>): DemoState {
  return {
    ...state,
    audit: [
      { ...event, id: createId('EVT'), source: 'demo' },
      ...state.audit,
    ],
  };
}

function tick(state: DemoState, minutes: number): DemoState {
  return { ...state, sim_time: addMinutes(state.sim_time, minutes) };
}

function requireRequest(state: DemoState, requestId: string): RequestRecord {
  const request = state.requests.find((item) => item.id === requestId);
  if (!request) throw new DemoError('درخواست موردنظر پیدا نشد.');
  return request;
}

function requireDonor(state: DemoState, donorId: string): DonorRecord {
  const donor = state.donors.find((item) => item.id === donorId);
  if (!donor) throw new DemoError('اهداکننده موردنظر پیدا نشد.');
  return donor;
}

function isTerminal(request: RequestRecord): boolean {
  return ['fulfilled', 'cancelled', 'expired'].includes(request.state);
}

function updateRequest(
  state: DemoState,
  requestId: string,
  update: (request: RequestRecord) => RequestRecord,
): DemoState {
  return {
    ...state,
    requests: state.requests.map((request) =>
      request.id === requestId ? update(request) : request,
    ),
  };
}

function updateDonor(
  state: DemoState,
  donorId: string,
  update: (donor: DonorRecord) => DonorRecord,
): DemoState {
  return {
    ...state,
    donors: state.donors.map((donor) =>
      donor.id === donorId ? update(donor) : donor,
    ),
  };
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(loadState);
  const [mode, setMode] = useState<StoreMode>('demo');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<{ hospitals: HospitalOption[]; centers: CenterOption[] }>({
    hospitals: HOSPITALS,
    centers: CENTERS,
  });

  useEffect(() => {
    if (mode !== 'demo') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ذخیره‌سازی محلی در حالت محدود مرورگر نباید UI را متوقف کند.
    }
  }, [mode, state]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [health, requestsResponse, inventoryResponse, catalogResponse, auditResponse, donorsResponse] =
        await Promise.all([
          getHealth(),
          getRequests(),
          getInventory(),
          getCatalog(),
          getAudit(),
          getDonors(),
        ]);
      if (!health.ok) throw new ApiError(503, 'Backend آماده نیست.');

      const centers = toCenters(catalogResponse);
      const hospitals = toHospitals(catalogResponse, centers);
      const requests = requestsResponse.items.map(mapRequest);
      const details = await Promise.all(
        requestsResponse.items.map((item) => getRequestDetail(item.request_id).catch(() => null)),
      );
      const dispatches = details.flatMap((detail) => {
        if (!detail) return [];
        const request = requests.find((entry) => entry.id === detail.request_id);
        return request ? detail.dispatches.map((item) => mapDispatch(item, request, centers)) : [];
      });
      const donors = donorsResponse.items.map((item) => mapDonor(item, requests, dispatches, centers));
      const audit = auditResponse.items.map(mapAudit);
      const latestSim = requestsResponse.items.reduce(
        (max, item) => Math.max(max, item.updated_sim, item.created_sim),
        0,
      );

      setCatalog({ hospitals, centers });
      setState({
        version: 1,
        sim_time: isoFromSimMinute(latestSim),
        requests,
        inventory: inventoryResponse.items.map((item) => mapInventory(item, centers)),
        donors,
        dispatches,
        audit,
      });
      setMode('live');
      setError(null);
    } catch (cause) {
      setMode('demo');
      setError(cause instanceof Error ? cause.message : 'اتصال به API برقرار نشد.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const createRequestDemo = useCallback((input: NewRequestInput): RequestRecord => {
    const now = addMinutes(state.sim_time, 4);
    const request: RequestRecord = {
      id: `REQ-2027-${String(9000 + state.requests.length + 1).padStart(4, '0')}`,
      hospital_id: input.hospital_id,
      hospital_name: input.hospital_name,
      blood_group: input.blood_group,
      product: input.product,
      units: input.units,
      urgency: input.urgency,
      note: input.note,
      state: 'pending_review',
      created_at: now,
      updated_at: now,
      counters: {
        needed: input.units,
        confirmed: 0,
        en_route: 0,
        arrived: 0,
        fulfilled: 0,
      },
      allocated_units: 0,
      supplied_units: 0,
      idempotency_key: createIdempotencyKey(),
      last_event: 'درخواست ثبت شد و در صف بررسی است.',
    };

    setState((previous) => {
      const next = tick(previous, 4);
      return appendAudit(
        {
          ...next,
          requests: [request, ...next.requests],
        },
        {
          at: now,
          actor: input.hospital_name,
          actor_role: 'hospital',
          type: 'request_created',
          request_id: request.id,
          summary: `درخواست ${input.units} واحد ${PRODUCT_LABELS[input.product]} ثبت شد.`,
          effect: 'state=pending_review',
        },
      );
    });

    return request;
  }, [state.requests.length, state.sim_time]);

  const approveRequestDemo = useCallback((requestId: string) => {
    const request = requireRequest(state, requestId);
    if (request.state !== 'pending_review') {
      throw new DemoError('فقط درخواست در حال انتظار بررسی قابل تأیید است.');
    }
    const now = addMinutes(state.sim_time, 3);
    setState((previous) => {
      const next = tick(previous, 3);
      const withRequest = updateRequest(next, requestId, (item) => ({
        ...item,
        state: 'open',
        updated_at: now,
        last_event: 'درخواست توسط هماهنگ‌کننده شبکه تأیید شد.',
      }));
      return appendAudit(withRequest, {
        at: now,
        actor: 'هماهنگ‌کننده شبکه',
        actor_role: 'coordinator',
        type: 'request_approved',
        request_id: requestId,
        summary: 'درخواست تأیید و وارد چرخه تأمین شد.',
        effect: 'state=open',
      });
    });
  }, [state]);

  const cancelRequestDemo = useCallback((requestId: string) => {
    const request = requireRequest(state, requestId);
    if (isTerminal(request)) {
      throw new DemoError('درخواست در وضعیت فعلی قابل لغو نیست.');
    }
    const now = addMinutes(state.sim_time, 3);
    setState((previous) => {
      const next = tick(previous, 3);
      const withRequest = updateRequest(next, requestId, (item) => ({
        ...item,
        state: 'cancelled',
        updated_at: now,
        last_event: 'درخواست توسط بیمارستان لغو شد.',
      }));
      return appendAudit(withRequest, {
        at: now,
        actor: request.hospital_name,
        actor_role: 'hospital',
        type: 'request_cancelled',
        request_id: requestId,
        summary: 'درخواست توسط بیمارستان لغو شد.',
        effect: 'state=cancelled',
      });
    });
  }, [state]);

  const amendRequestDemo = useCallback((requestId: string, urgency: Urgency) => {
    const request = requireRequest(state, requestId);
    if (isTerminal(request)) {
      throw new DemoError('درخواست در وضعیت فعلی قابل اصلاح نیست.');
    }
    const now = addMinutes(state.sim_time, 2);
    setState((previous) => {
      const next = tick(previous, 2);
      const withRequest = updateRequest(next, requestId, (item) => ({
        ...item,
        urgency,
        updated_at: now,
        last_event: 'سطح فوریت درخواست اصلاح شد.',
      }));
      return appendAudit(withRequest, {
        at: now,
        actor: request.hospital_name,
        actor_role: 'hospital',
        type: 'request_amended',
        request_id: requestId,
        summary: 'سطح فوریت درخواست اصلاح شد.',
        effect: `urgency=${urgency}`,
      });
    });
  }, [state]);

  const dispatchInventoryDemo = useCallback((input: DispatchInput): DispatchRecord => {
    const request = requireRequest(state, input.request_id);
    const item = state.inventory.find((entry) => entry.id === input.item_id);
    if (!item) throw new DemoError('واحد موجودی انتخاب‌شده پیدا نشد.');
    if (request.state === 'pending_review') {
      throw new DemoError('درخواست هنوز تأیید نشده و قابل تخصیص موجودی نیست.');
    }
    if (isTerminal(request)) {
      throw new DemoError('درخواست در وضعیت فعلی قابل تخصیص موجودی نیست.');
    }
    if (input.units < 1 || input.units > item.units) {
      throw new DemoError('تعداد واحد انتخاب‌شده از موجودی این ردیف بیشتر است.');
    }
    if (item.product !== request.product) {
      throw new DemoError('نوع فرآورده موجودی با درخواست یکسان نیست.');
    }
    if (!isCompatible(item.blood_group, request.blood_group, request.product)) {
      throw new DemoError('گروه خونی این موجودی با گیرنده سازگار نیست.');
    }
    const expiresAt = isoFromSimMinute(item.expires_sim_min);
    if (minutesBetween(state.sim_time, expiresAt) <= 0) {
      throw new DemoError('این موجودی منقضی شده و قابل تخصیص نیست.');
    }
    if (state.dispatches.some((dispatch) => dispatch.id === input.dispatch_id)) {
      throw new DemoError('شناسه تخصیص تکراری است.');
    }

    const hospital = HOSPITALS.find((entry) => entry.id === request.hospital_id);
    const travel = hospital?.travel_min[item.center_id] ?? 30;
    const eta = 10 + travel;
    const now = addMinutes(state.sim_time, 7);
    const dispatch: DispatchRecord = {
      id: input.dispatch_id,
      request_id: request.id,
      center_id: item.center_id,
      center_name: item.center_name,
      blood_group: item.blood_group,
      recipient_blood_group: request.blood_group,
      product: request.product,
      units: input.units,
      status: 'sent',
      eta_sim_min: eta,
      created_at: now,
    };

    setState((previous) => {
      const next = tick(previous, 7);
      const inventory = next.inventory
        .map((entry) =>
          entry.id === item.id ? { ...entry, units: entry.units - input.units } : entry,
        )
        .filter((entry) => entry.units > 0);
      const requests = next.requests.map((entry) =>
        entry.id === request.id
          ? {
              ...entry,
              allocated_units: entry.allocated_units + input.units,
              state: entry.state === 'open' ? 'mobilizing' : entry.state,
              updated_at: now,
              last_event: `${input.units} واحد ${PRODUCT_LABELS[request.product]} از ${item.center_name} تخصیص یافت.`,
            }
          : entry,
      );
      return appendAudit(
        {
          ...next,
          inventory,
          requests,
          dispatches: [dispatch, ...next.dispatches],
        },
        {
          at: now,
          actor: item.center_name,
          actor_role: 'center',
          type: 'dispatch_created',
          request_id: request.id,
          summary: `${input.units} واحد ${PRODUCT_LABELS[request.product]} از ${item.center_name} تخصیص یافت.`,
          effect: `allocated +${input.units}؛ تأمین‌شده بدون تغییر`,
        },
      );
    });

    return dispatch;
  }, [state]);

  const respondDonorDemo = useCallback((donorId: string, response: 'accepted' | 'declined') => {
    const donor = requireDonor(state, donorId);
    if (donor.status !== 'invited') {
      throw new DemoError('این دعوت قبلاً پاسخ داده شده است.');
    }
    const request = requireRequest(state, donor.request_id);
    if (isTerminal(request)) {
      throw new DemoError('درخواست مرتبط با این دعوت فعال نیست.');
    }
    const now = addMinutes(state.sim_time, 2);
    setState((previous) => {
      const next = tick(previous, 2);
      const withDonor = updateDonor(next, donorId, (item) => ({
        ...item,
        status: response,
        updated_at: now,
      }));
      const withRequest = updateRequest(withDonor, donor.request_id, (item) => ({
        ...item,
        state:
          response === 'accepted' && item.state === 'open'
            ? 'mobilizing'
            : item.state,
        counters: {
          ...item.counters,
          confirmed:
            response === 'accepted' ? item.counters.confirmed + 1 : item.counters.confirmed,
        },
        updated_at: now,
        last_event:
          response === 'accepted'
            ? `${donor.name} دعوت اهدا را پذیرفت.`
            : `${donor.name} دعوت اهدا را رد کرد.`,
      }));
      return appendAudit(withRequest, {
        at: now,
        actor: donor.name,
        actor_role: 'donor',
        type: response === 'accepted' ? 'donor_accepted' : 'donor_declined',
        request_id: donor.request_id,
        summary:
          response === 'accepted'
            ? 'اهداکننده دعوت را پذیرفت.'
            : 'اهداکننده دعوت را رد کرد.',
        effect:
          response === 'accepted'
            ? 'confirmed +۱؛ تأمین‌شده بدون تغییر'
            : 'تأمین‌شده بدون تغییر',
      });
    });
  }, [state]);

  const progressDonorDemo = useCallback((donorId: string, progress: DonorProgress) => {
    const donor = requireDonor(state, donorId);
    const request = requireRequest(state, donor.request_id);
    if (isTerminal(request)) {
      throw new DemoError('درخواست مرتبط با این اهداکننده فعال نیست.');
    }

    const allowed: Record<DonorRecord['status'], DonorProgress[]> = {
      invited: [],
      accepted: ['en_route'],
      declined: [],
      en_route: ['arrived'],
      arrived: ['screen_pass', 'screen_fail'],
      screen_pass: ['donated', 'no_show'],
      screen_fail: [],
      donated: [],
      no_show: [],
    };

    if (!allowed[donor.status].includes(progress)) {
      throw new DemoError('این رویداد در وضعیت فعلی اهداکننده مجاز نیست.');
    }
    if (progress === 'donated' && request.supplied_units >= request.units) {
      throw new DemoError('همه واحدهای این درخواست قبلاً تأمین شده است.');
    }

    const now = addMinutes(state.sim_time, 6);
    const supplied = progress === 'donated' ? 1 : 0;
    const nextSupplied = request.supplied_units + supplied;
    const nextState: RequestRecord['state'] =
      nextSupplied >= request.units
        ? 'fulfilled'
        : nextSupplied > 0
          ? 'partially_fulfilled'
          : request.state;
    const copy: Record<DonorProgress, { type: string; summary: string; effect: string }> = {
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

    setState((previous) => {
      const next = tick(previous, 6);
      const withDonor = updateDonor(next, donorId, (item) => ({
        ...item,
        status: progress,
        updated_at: now,
        gateway_status: progress === 'donated' ? 'delivered' : item.gateway_status,
      }));
      const withRequest = updateRequest(withDonor, donor.request_id, (item) => ({
        ...item,
        state: nextState,
        updated_at: now,
        supplied_units: item.supplied_units + supplied,
        counters: {
          ...item.counters,
          en_route:
            progress === 'en_route' ? item.counters.en_route + 1 : item.counters.en_route,
          arrived:
            progress === 'arrived' ? item.counters.arrived + 1 : item.counters.arrived,
          fulfilled:
            progress === 'donated' ? item.counters.fulfilled + 1 : item.counters.fulfilled,
        },
        last_event: copy[progress].summary,
      }));
      return appendAudit(withRequest, {
        at: now,
        actor: donor.name,
        actor_role: 'donor',
        type: copy[progress].type,
        request_id: donor.request_id,
        summary: `${copy[progress].summary} (${donor.id})`,
        effect: copy[progress].effect,
      });
    });
  }, [state]);

  const resetDemoLocal = useCallback(() => {
    const fresh = createSeedState();
    setState({ ...fresh, sim_time: DEMO_START_ISO });
  }, []);

  const createRequest = useCallback(async (input: NewRequestInput): Promise<RequestRecord> => {
    if (mode !== 'live') return createRequestDemo(input);
    const created = await apiCreateRequest(
      {
        hospital_id: input.hospital_id,
        blood_group: input.blood_group,
        product: input.product,
        units: input.units,
        urgency: input.urgency,
        note: input.note,
      },
      createIdempotencyKey(),
      simMinuteOf(state.sim_time),
    );
    await refresh();
    return mapRequest(created);
  }, [createRequestDemo, mode, refresh, state.sim_time]);

  const approveRequest = useCallback(async (requestId: string): Promise<void> => {
    if (mode !== 'live') {
      approveRequestDemo(requestId);
      return;
    }
    await apiApproveRequest(requestId, simMinuteOf(state.sim_time));
    await refresh();
  }, [approveRequestDemo, mode, refresh, state.sim_time]);

  const cancelRequest = useCallback(async (requestId: string): Promise<void> => {
    if (mode !== 'live') {
      cancelRequestDemo(requestId);
      return;
    }
    await apiCancelRequest(requestId, simMinuteOf(state.sim_time));
    await refresh();
  }, [cancelRequestDemo, mode, refresh, state.sim_time]);

  const amendRequest = useCallback(async (requestId: string, urgency: Urgency): Promise<void> => {
    if (mode !== 'live') {
      amendRequestDemo(requestId, urgency);
      return;
    }
    await apiAmendRequest(requestId, urgency, simMinuteOf(state.sim_time));
    await refresh();
  }, [amendRequestDemo, mode, refresh, state.sim_time]);

  const dispatchInventory = useCallback(async (input: DispatchInput): Promise<DispatchRecord> => {
    if (mode !== 'live') return dispatchInventoryDemo(input);
    const request = requireRequest(state, input.request_id);
    const item = state.inventory.find((entry) => entry.id === input.item_id);
    if (!item) throw new DemoError('واحد موجودی انتخاب‌شده پیدا نشد.');
    await apiDispatchInventory(
      {
        dispatch_id: input.dispatch_id,
        request_id: input.request_id,
        center_id: item.center_id,
        blood_group: item.blood_group,
        product: item.product,
        units: input.units,
      },
      simMinuteOf(state.sim_time),
    );
    await refresh();
    return {
      id: input.dispatch_id,
      request_id: request.id,
      center_id: item.center_id,
      center_name: item.center_name,
      blood_group: item.blood_group,
      recipient_blood_group: request.blood_group,
      product: item.product,
      units: input.units,
      status: 'sent',
      eta_sim_min: 30,
      created_at: state.sim_time,
    };
  }, [dispatchInventoryDemo, mode, refresh, state]);

  const respondDonor = useCallback(async (
    donorId: string,
    response: 'accepted' | 'declined',
  ): Promise<void> => {
    if (mode !== 'live') {
      respondDonorDemo(donorId, response);
      return;
    }
    const donor = requireDonor(state, donorId);
    await apiRespondDonor({
      event_id: createId('EVT'),
      request_id: donor.request_id,
      donor_id: donor.id,
      response,
      sim_time: simMinuteOf(state.sim_time),
    });
    await refresh();
  }, [mode, refresh, respondDonorDemo, state]);

  const progressDonor = useCallback(async (
    donorId: string,
    progress: DonorProgress,
  ): Promise<void> => {
    if (mode !== 'live') {
      progressDonorDemo(donorId, progress);
      return;
    }
    const donor = requireDonor(state, donorId);
    await apiProgressDonor({
      event_id: createId('EVT'),
      request_id: donor.request_id,
      donor_id: donor.id,
      event: progress,
      sim_time: simMinuteOf(state.sim_time),
    });
    await refresh();
  }, [mode, progressDonorDemo, refresh, state]);

  const resetDemo = useCallback(async (): Promise<void> => {
    if (mode === 'live') {
      await refresh();
      return;
    }
    resetDemoLocal();
  }, [mode, refresh, resetDemoLocal]);

  const value = useMemo<DemoStoreValue>(() => ({
    state,
    mode,
    isLoading,
    error,
    hospitals: catalog.hospitals,
    centers: catalog.centers,
    refresh,
    createRequest,
    approveRequest,
    cancelRequest,
    amendRequest,
    dispatchInventory,
    respondDonor,
    progressDonor,
    resetDemo,
  }), [
    state,
    mode,
    isLoading,
    error,
    catalog,
    refresh,
    createRequest,
    approveRequest,
    cancelRequest,
    amendRequest,
    dispatchInventory,
    respondDonor,
    progressDonor,
    resetDemo,
  ]);

  return (
    <DemoStoreContext.Provider value={value}>
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore(): DemoStoreValue {
  const value = useContext(DemoStoreContext);
  if (!value) {
    throw new Error('useDemoStore must be used inside DemoStoreProvider');
  }
  return value;
}

export function inventoryExpiresAt(item: InventoryItem): string {
  return isoFromSimMinute(item.expires_sim_min);
}

export function compatibleInventoryFor(
  state: DemoState,
  request: Pick<RequestRecord, 'product' | 'blood_group'>,
): InventoryItem[] {
  return state.inventory
    .filter(
      (item) =>
        item.units > 0 &&
        item.product === request.product &&
        isCompatible(item.blood_group, request.blood_group, request.product) &&
        minutesBetween(state.sim_time, inventoryExpiresAt(item)) > 0,
    )
    .sort((a, b) => a.expires_sim_min - b.expires_sim_min);
}

export function compatibleUnitsFor(
  state: DemoState,
  request: Pick<RequestRecord, 'product' | 'blood_group'>,
): number {
  return compatibleInventoryFor(state, request).reduce((sum, item) => sum + item.units, 0);
}

export function remainingUnits(request: RequestRecord): number {
  return Math.max(0, request.units - request.supplied_units);
}

export function activeRequestCount(state: DemoState): number {
  return state.requests.filter(
    (request) => !['fulfilled', 'cancelled', 'expired'].includes(request.state),
  ).length;
}
