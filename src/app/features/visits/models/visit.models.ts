export type VisitStatus = 'PENDIENTE' | 'INGRESADA' | 'FINALIZADA' | 'CANCELADA';
export type VisitRegistrationType = 'MANUAL_CONSERJERIA' | 'PREAUTORIZADA_RESIDENTE';

export interface VisitUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Visit {
  id: string;
  visitorName: string;
  visitorDocument: string;
  visitorPhone: string | null;
  vehiclePlate: string | null;
  residentName: string;
  unitLabel: string | null;
  blockLabel: string | null;
  status: VisitStatus;
  registrationType: VisitRegistrationType;
  observations: string | null;
  entryAt: string | null;
  exitAt: string | null;
  createdAt: string;
  updatedAt: string;
  residentUser: VisitUserSummary | null;
  recordedByUser: VisitUserSummary;
}

export interface CreateVisitRequest {
  visitorName: string;
  visitorDocument: string;
  visitorPhone: string | null;
  vehiclePlate: string | null;
  residentName: string;
  unitLabel: string | null;
  blockLabel: string | null;
  observations: string | null;
  registrationType: VisitRegistrationType;
}

export interface UpdateVisitStatusRequest {
  status: VisitStatus;
}
