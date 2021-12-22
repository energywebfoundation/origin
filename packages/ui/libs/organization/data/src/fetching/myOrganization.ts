import { useUser } from './user';

export const useMyOrganizationData = () => {
  const { user, userLoading } = useUser();

  const organization = user?.organization;
  return { organizationLoading: userLoading, organization };
};
