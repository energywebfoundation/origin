import { TCreateDeviceWithSupply, IDeviceWithSupply } from './types';

export const createDeviceWithSupply = ({
  device,
  supplies,
  allFuelTypes,
}: TCreateDeviceWithSupply) => {
  const matchingSupply = supplies.find(
    (supply) => supply?.deviceId === device.id
  );

  const deviceWithSupply: IDeviceWithSupply = {
    deviceId: device?.id,
    fuelType:
      allFuelTypes?.find((type) => type.code === device?.fuelType)?.name || '',
    facilityName: device?.name,
    price: matchingSupply?.price ?? 0,
    active: matchingSupply?.active,
    supplyId: matchingSupply?.id,
  };

  return deviceWithSupply;
};
