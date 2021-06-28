import { useApiFetchAllDevices } from '@energyweb/origin-ui-device-data';

export const useMapViewPageEffects = () => {
  const { allDevices, isLoading } = useApiFetchAllDevices();

  return { allDevices, isLoading };
};
