import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';

export const useMyOrganizationData = () => {
  const { isLoading: organizationLoading, data: user } = useUserControllerMe();

  const organization = user?.organization;
  return { organizationLoading, organization };
};
