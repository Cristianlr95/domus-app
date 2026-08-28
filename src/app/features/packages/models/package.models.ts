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
  trackingNumber: string | null;
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
  residentUserId: string | null;
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

export type PackagePickupMethod = 'MANUAL_BOOK' | 'QR' | 'TRUSTED_PERSON';

export interface CustodyDeliveryRequest {
  packageIds: string[];
  receiverName: string;
  method: PackagePickupMethod;
  token: string | null;
  bookNumber: string | null;
  bookPage: number | null;
  notes: string | null;
}

export interface PackageCustodyEvent {
  id: string;
  event_type: 'RECEIVED' | 'NOTIFIED' | 'DELIVERED' | string;
  receiver_name: string | null;
  method: string | null;
  book_number: string | null;
  book_page: number | null;
  notes: string | null;
  occurred_at: string;
  actor_first_name: string | null;
  actor_last_name: string | null;
}

export interface PackageReceptionItem {
  description: string;
  residentName: string;
  unitLabel: string | null;
  blockLabel: string | null;
  trackingNumber: string | null;
  packageType: PackageType;
  residentUserId: string | null;
}

export interface CreatePackageReceptionRequest {
  carrier: string | null;
  notes: string | null;
  packages: PackageReceptionItem[];
}

export interface CreatePackagePickupCodeRequest {
  packageId: string;
  authorizedPersonName: string;
  authorizedPersonDocument: string | null;
  authorizationType: 'SINGLE' | 'GROUP' | 'RECURRING';
}

export interface PackagePickupCode {
  id: string;
  token: string;
  packageId: string;
  expiresAt: string;
}

export interface PackageMetrics {
  pending: number;
  receivedToday: number;
  deliveredToday: number;
  overdue: number;
  openIncidents: number;
}

export interface PackagePickupAuthorization {
  id: string;
  unit_id: string;
  authorized_person_name: string;
  authorized_person_document: string | null;
  authorization_type: string;
  valid_from: string;
  valid_until: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface PackageIncident {
  id: string;
  package_id: string;
  category: string;
  status: 'OPEN' | 'RESOLVED';
  description: string;
  evidence_reference: string | null;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
  reporter_first_name: string;
  reporter_last_name: string;
  resolver_first_name: string | null;
  resolver_last_name: string | null;
}

export interface CreatePackageIncidentRequest {
  packageId: string;
  category: string;
  description: string;
  evidenceReference: string | null;
}
