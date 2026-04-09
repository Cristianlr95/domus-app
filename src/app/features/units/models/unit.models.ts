import { ResidentType } from '../../residents/models/resident.models';

export interface UnitResidentSummary {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  active: boolean;
  residentType: ResidentType;
}

export interface Unit {
  id: string;
  unitCode: string;
  blockLabel: string;
  floorNumber: number | null;
  active: boolean;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  residents: UnitResidentSummary[];
}

export interface CreateUnitRequest {
  unitCode: string;
  blockLabel: string;
  floorNumber: number | null;
  observations: string | null;
  residentIds: string[];
}

export interface UpdateUnitRequest extends CreateUnitRequest {}

export interface UpdateUnitStatusRequest {
  active: boolean;
}
