import { useDeviceControllerGetFuelTypes } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';

export const useAllDeviceFuelTypes = () => {
  const { data: allTypes, isLoading } = useDeviceControllerGetFuelTypes({
    staleTime: 1000000,
  });

  return { allTypes, isLoading };
};
