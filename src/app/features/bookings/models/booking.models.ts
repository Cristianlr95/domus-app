export type BookingStatus =
  | 'DISPONIBLE'
  | 'RESERVADA'
  | 'CONFIRMADA'
  | 'CANCELADA'
  | 'COMPLETADA';
export type SpaceType =
  | 'SALON_COMUNAL'
  | 'TERRAZA'
  | 'GIMNASIO'
  | 'PISCINA'
  | 'CANCHA_TENIS'
  | 'PARQUE_INFANTIL'
  | 'OTRO';

export interface CommonSpace {
  id: string;
  name: string;
  type: SpaceType;
  capacity: number;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export interface BookingUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
}

export interface Booking {
  id: string;
  commonSpaceId: string;
  commonSpaceName: string;
  commonSpaceType: SpaceType;
  residentId: string;
  residentName: string;
  unitLabel: string | null;
  blockLabel: string | null;
  status: BookingStatus;
  bookingDate: string;
  startTime: string;
  endTime: string;
  guestCount: number | null;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  residentUser: BookingUserSummary;
  approvedByUser: BookingUserSummary | null;
}

export interface CreateBookingRequest {
  commonSpaceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  guestCount?: number;
  observations?: string;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  observations?: string;
}

export interface BookingFilter {
  status?: BookingStatus | '';
  spaceType?: SpaceType | '';
  startDate?: string;
  endDate?: string;
  search?: string;
}
