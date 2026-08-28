export interface LaundryMachine {
  id: string;
  asset_name: string;
  asset_location: string | null;
  machine_type: 'WASHER' | 'DRYER';
  operation_mode: 'TOKEN' | 'AUTHORIZATION' | 'MIXED';
  status: string;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  usage_limit_per_week: number | null;
  usage_limit_per_day: number | null;
  max_simultaneous_usages: number | null;
  allow_parallel_washer_dryer: boolean;
  enabled: boolean;
  requires_token: boolean;
}

export interface LaundryUsage {
  id: string;
  machine_id: string;
  asset_name: string;
  resident_first_name: string;
  resident_last_name: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  tokens_delivered: number;
}

export interface LaundryMetrics {
  available: number;
  reserved: number;
  inUse: number;
  outOfService: number;
  pendingRequests: number;
}
