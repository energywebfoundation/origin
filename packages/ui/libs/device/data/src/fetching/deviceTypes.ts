import {
  CodeNameDTO,
  getDeviceControllerGetDeviceTypesQueryKey,
  useDeviceControllerGetDeviceTypes,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useQueryClient } from 'react-query';

export const useAllDeviceTypes = () => {
  const queryClient = useQueryClient();
  const key = getDeviceControllerGetDeviceTypesQueryKey();

  const cachedData: CodeNameDTO[] | undefined = queryClient.getQueryData(key);

  const { data, isLoading } = useDeviceControllerGetDeviceTypes({
    query: {
      staleTime: 1000000,
      enabled: !cachedData,
    },
  });

  const allTypes = cachedData ?? data;

  return { allTypes, isLoading };
};
