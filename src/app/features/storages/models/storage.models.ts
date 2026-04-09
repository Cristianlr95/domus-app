export type StorageType = 'PEQUENA' | 'MEDIANA' | 'GRANDE';
export type StorageOccupancyStatus = 'DISPONIBLE' | 'OCUPADA';

export interface StorageUnitSummary {
  id: string;
  unitCode: string;
  blockLabel: string;
  floorNumber: number | null;
}

export interface StorageItem {
  id: string;
  storageCode: string;
  storageType: StorageType;
  occupancyStatus: StorageOccupancyStatus;
  active: boolean;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  unit: StorageUnitSummary;
}

export interface CreateStorageRequest {
  storageCode: string;
  storageType: StorageType;
  occupancyStatus: StorageOccupancyStatus;
  unitId: string;
  observations: string | null;
}

export interface UpdateStorageRequest extends CreateStorageRequest {}

export interface UpdateStorageStatusRequest {
  active: boolean;
  occupancyStatus: StorageOccupancyStatus;
}
