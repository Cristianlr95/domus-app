export type ResidentType = 'PROPIETARIO' | 'ARRENDATARIO' | 'OCUPANTE';

export interface ResidentLinkedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ResidentUnitSummary {
  id: string;
  unitCode: string;
  blockLabel: string;
  floorNumber: number | null;
}

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  residentType: ResidentType;
  unit: ResidentUnitSummary | null;
  createdAt: string;
  updatedAt: string;
  linkedUser: ResidentLinkedUser | null;
}

export interface CreateResidentRequest {
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string | null;
  phone: string | null;
  residentType: ResidentType;
  linkedUserId: string | null;
  unitId: string | null;
}

export interface UpdateResidentRequest extends CreateResidentRequest {}

export interface UpdateResidentStatusRequest {
  active: boolean;
}
