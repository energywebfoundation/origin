import { CodeNameDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { getDeviceControllerGetDeviceTypesQueryKey } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useQueryClient } from 'react-query';

export const useCachedAllDeviceTypes = () => {
  const queryClient = useQueryClient();
  const deviceTypesQueryKey = getDeviceControllerGetDeviceTypesQueryKey();

  return queryClient.getQueryData<CodeNameDTO[]>(deviceTypesQueryKey);
};
