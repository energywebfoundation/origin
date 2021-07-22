export enum SupplyStatus {
  Active = 'Active',
  Paused = 'Paused',
}

export const supplyStatusOptions = Object.keys(SupplyStatus).map((key) => ({
  value: key,
  label: key,
}));
