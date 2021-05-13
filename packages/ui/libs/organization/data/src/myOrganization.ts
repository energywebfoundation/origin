import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';

export const useMyOrganizationData = () => {
  const { isLoading, data: user } = useUserControllerMe();

  return { isLoading, organization: user.organization };
};
