import {
  CodeNameDTO,
  getDeviceControllerGetFuelTypesQueryKey,
  useDeviceControllerGetFuelTypes,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useQueryClient } from 'react-query';

export const useAllDeviceFuelTypes = () => {
  const queryClient = useQueryClient();
  const key = getDeviceControllerGetFuelTypesQueryKey();

  const cachedData: CodeNameDTO[] | undefined = queryClient.getQueryData(key);

  const { data, isLoading } = useDeviceControllerGetFuelTypes({
    query: {
      staleTime: 1000000,
      enabled: !cachedData,
    },
  });

  const allTypes = cachedData ?? data;

  return { allTypes, isLoading };
};
