import { useApiAllDevices } from '@energyweb/origin-ui-device-data';

export const useMapViewPageEffects = () => {
  const { allDevices, isLoading } = useApiAllDevices();

  return { allDevices, isLoading };
};
