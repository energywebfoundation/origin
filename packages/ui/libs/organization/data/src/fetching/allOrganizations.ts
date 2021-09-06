import { useOrganizationControllerGetAll } from '@energyweb/origin-backend-react-query-client';

export const useAllOrganizations = () => {
  const { data: allOrganizations, isLoading } =
    useOrganizationControllerGetAll();

  return { allOrganizations, isLoading };
};
