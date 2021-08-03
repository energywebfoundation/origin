import { useDeviceControllerGetDeviceTypes } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';

export const useAllDeviceTypes = () => {
  const { data: allTypes, isLoading } = useDeviceControllerGetDeviceTypes({
    staleTime: 1000000,
  });

  return { allTypes, isLoading };
};
