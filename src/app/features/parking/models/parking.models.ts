import { ResidentType } from '../../residents/models/resident.models';

export type ParkingType = 'RESIDENTE' | 'VISITA' | 'COMUN';
export type ParkingOccupancyStatus = 'DISPONIBLE' | 'OCUPADO';

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
