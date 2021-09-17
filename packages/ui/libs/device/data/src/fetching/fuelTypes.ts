import { useDeviceControllerGetFuelTypes } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';

export const useAllDeviceFuelTypes = () => {
  const { data: allTypes, isLoading } = useDeviceControllerGetFuelTypes({
    query: {
      staleTime: 1000000,
    },
  });

  return { allTypes, isLoading };
};
