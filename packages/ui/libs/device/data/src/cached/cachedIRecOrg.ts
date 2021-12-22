import {
  getRegistrationControllerGetRegistrationsQueryKey,
  RegistrationDTO,
} from '@energyweb/origin-organization-irec-api-react-query-client';
import { useQueryClient } from 'react-query';

export const useCachedIRecOrg = () => {
  const queryClient = useQueryClient();
  const iRecOrgQueryKey = getRegistrationControllerGetRegistrationsQueryKey();

  const iRecOrg: RegistrationDTO[] | undefined =
    queryClient.getQueryData(iRecOrgQueryKey);

  return iRecOrg?.[0];
};
