import { CodeNameDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { getDeviceControllerGetFuelTypesQueryKey } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { useQueryClient } from 'react-query';

export const useCachedAllFuelTypes = () => {
  const queryClient = useQueryClient();
  const fuelTypesQueryKey = getDeviceControllerGetFuelTypesQueryKey();

  return queryClient.getQueryData<CodeNameDTO[]>(fuelTypesQueryKey);
};
