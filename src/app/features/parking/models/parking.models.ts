import { ResidentType } from '../../residents/models/resident.models';

export type ParkingType = 'RESIDENTE' | 'VISITA' | 'COMUN';
export type ParkingOccupancyStatus = 'DISPONIBLE' | 'RESERVADO' | 'OCUPADO' | 'FUERA_DE_SERVICIO';
export type ParkingSessionStatus =
  | 'REQUESTED' | 'RESERVED' | 'OCCUPIED' | 'END_REQUESTED'
  | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

export interface ParkingUnitSummary {
  id: string;
  unitCode: string;
  blockLabel: string;
  floorNumber: number | null;
}

export interface ParkingResidentSummary {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  residentType: ResidentType;
  active: boolean;
}

export interface ParkingSpot {
  id: string;
  spotCode: string;
  parkingType: ParkingType;
  occupancyStatus: ParkingOccupancyStatus;
  active: boolean;
  vehiclePlate: string | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  unit: ParkingUnitSummary | null;
  resident: ParkingResidentSummary | null;
}

export interface CreateParkingRequest {
  spotCode: string;
  parkingType: ParkingType;
  occupancyStatus: ParkingOccupancyStatus;
  unitId: string | null;
  residentId: string | null;
  vehiclePlate: string | null;
  observations: string | null;
}

export interface UpdateParkingRequest extends CreateParkingRequest {}

export interface UpdateParkingStatusRequest {
  active: boolean;
  occupancyStatus: ParkingOccupancyStatus;
}

export interface ParkingUnitOption {
  id: string;
  unit_code: string;
  block_label: string;
}

export interface ParkingOperationalSpace {
  id: string;
  spot_code: string;
  parking_type: ParkingType;
  occupancy_status: ParkingOccupancyStatus;
  is_active: boolean;
  vehicle_plate: string | null;
  observations: string | null;
}

export interface ParkingSession {
  id: string;
  parking_spot_id: string | null;
  unit_id: string;
  requested_by_user_id: string;
  status: ParkingSessionStatus;
  visitor_name: string | null;
  vehicle_plate: string | null;
  requested_at: string;
  billable_from: string | null;
  arrived_at: string | null;
  end_requested_at: string | null;
  completed_at: string | null;
  rate_amount_snapshot: number | null;
  grace_minutes_snapshot: number | null;
  rounding_minutes_snapshot: number | null;
  currency_snapshot: string | null;
  total_amount: number | null;
  elapsed_minutes: number;
  current_amount: number;
  spot_code: string | null;
  occupancy_status: ParkingOccupancyStatus | null;
  unit_code: string;
  block_label: string;
  notes: string | null;
  cancellation_reason: string | null;
  assignmentSpotId?: string;
  plateInput?: string;
}

export interface ParkingRate {
  id: string;
  name: string;
  amount_per_hour: number;
  grace_minutes: number;
  rounding_minutes: number;
  currency: string;
  effective_from: string;
}

export interface ParkingMetrics {
  visitorSpaces: number;
  availableSpaces: number;
  outOfServiceSpaces: number;
  pendingRequests: number;
  activeSessions: number;
  settledRevenue: number;
  averageMinutes: number;
}
