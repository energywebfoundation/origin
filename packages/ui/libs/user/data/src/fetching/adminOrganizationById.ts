import { useOrganizationControllerGet } from '@energyweb/origin-backend-react-query-client';

export const useAdminGetOrganizationById = (id: string) => {
  const { data: organization, isLoading: organizationLoading } =
    useOrganizationControllerGet(parseInt(id));

  return { organization, organizationLoading };
};
