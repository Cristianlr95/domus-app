export type PropertyType =
  | 'APARTAMENTO'
  | 'CASA'
  | 'SUITE'
  | 'ESTUDIO'
  | 'PENTHOUSE'
  | 'OTRO';
export type PropertyStatus =
  | 'DISPONIBLE'
  | 'OCUPADA'
  | 'MANTENIMIENTO'
  | 'VENTA'
  | 'ALQUILER';

export interface Property {
  id: string;
  label: string;
  blockLabel: string | null;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number | null;
  floor: number | null;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string | null;
  residentsCount: number | null;
  observations: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyRequest {
  label: string;
  blockLabel?: string;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  squareMeters?: number;
  floor?: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  residentsCount?: number;
  observations?: string;
}

export interface UpdatePropertyRequest {
  status?: PropertyStatus;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  residentsCount?: number;
  observations?: string;
}

export interface PropertyFilter {
  type?: PropertyType | '';
  status?: PropertyStatus | '';
  block?: string;
  search?: string;
}
