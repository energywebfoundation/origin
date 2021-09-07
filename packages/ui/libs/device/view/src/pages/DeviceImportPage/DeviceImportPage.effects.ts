import { useAllDeviceFuelTypes } from '@energyweb/origin-ui-device-data';

export const useDeviceImportPageEffects = () => {
  const {
    allTypes: allFuelTypes,
    isLoading: areFuelTypesLoading,
  } = useAllDeviceFuelTypes();

  const isLoading = areFuelTypesLoading;
  return { isLoading, allFuelTypes };
};
