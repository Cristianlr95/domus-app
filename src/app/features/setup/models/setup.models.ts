export type CondominiumStatus = 'SETUP' | 'PILOT' | 'ACTIVE' | 'SUSPENDED';

export interface SetupCondominium {
  id: string;
  name: string;
  address: string | null;
  status: CondominiumStatus;
}

export interface SetupUnitSpec {
  blockLabel: string;
  unitCode: string;
  floorNumber: number | null;
}

export interface SetupBatchResult {
  id: string;
  status: string;
}
