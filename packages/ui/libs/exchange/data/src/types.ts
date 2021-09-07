export type IDeviceWithSupply = {
  deviceId: string;
  facilityName: string;
  fuelType: string;
  price: number;
  active?: boolean;
  supplyId?: string;
};

export type TUpdateSupplyFormValues = {
  fuelType: string;
  facilityName: string;
  price: number;
  status: string;
};

export enum SupplyStatus {
  Active = 'Active',
  Paused = 'Paused',
}
