export type PackageStatus = 'RECIBIDA' | 'NOTIFICADA' | 'ENTREGADA' | 'CANCELADA';
export type PackageType = 'PAQUETE' | 'DOCUMENTO' | 'DELIVERY' | 'OTRO';

export interface PackageUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PackageItem {
  id: string;
  description: string;
  senderName: string | null;
  packageType: PackageType;
  residentName: string;
  unitLabel: string | null;
  blockLabel: string | null;
  receivedAt: string;
  deliveredAt: string | null;
  status: PackageStatus;
  observations: string | null;
  receivedByName: string | null;
  deliveredToName: string | null;
  createdAt: string;
  updatedAt: string;
  residentUser: PackageUserSummary | null;
  recordedByUser: PackageUserSummary;
}

export interface CreatePackageRequest {
  description: string;
  senderName: string | null;
  packageType: PackageType;
  residentName: string;
  unitLabel: string | null;
  blockLabel: string | null;
  observations: string | null;
  receivedByName: string | null;
}

export interface UpdatePackageStatusRequest {
  status: PackageStatus;
}

export interface DeliverPackageRequest {
  deliveredToName: string;
}
