import { useAllDeviceFuelTypes } from '@energyweb/origin-ui-device-data';

export const useDeviceImportPageEffects = () => {
  const { allTypes: allFuelTypes, isLoading } = useAllDeviceFuelTypes();

  return { isLoading, allFuelTypes };
};
