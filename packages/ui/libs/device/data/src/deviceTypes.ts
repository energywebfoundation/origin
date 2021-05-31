import { useDeviceControllerGetFuels } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';

export const useAllExistingDeviceTypes = () => {
  const { data: allTypes, isLoading } = useDeviceControllerGetFuels({
    staleTime: 1000000,
  });

  return { allTypes, isLoading };
};
