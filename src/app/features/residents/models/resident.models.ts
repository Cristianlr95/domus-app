export type ResidentType = 'PROPIETARIO' | 'ARRENDATARIO' | 'OCUPANTE';

export interface ResidentLinkedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
  unitLabel: string | null;
  blockLabel: string | null;
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
  unitLabel: string | null;
  blockLabel: string | null;
  linkedUserId: string | null;
}

export interface UpdateResidentRequest extends CreateResidentRequest {}

export interface UpdateResidentStatusRequest {
  active: boolean;
}
