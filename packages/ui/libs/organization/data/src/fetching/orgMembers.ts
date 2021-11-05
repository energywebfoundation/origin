import {
  useOrganizationControllerGetUsers,
  useUserControllerMe,
} from '@energyweb/origin-backend-react-query-client';

export const useOrganizationMembersData = () => {
  const { data: user, isLoading: isUserLoading } = useUserControllerMe();
  const organizationId = user?.organization?.id;

  const { isLoading: isMembersLoading, data: members } =
    useOrganizationControllerGetUsers(organizationId);

  return { isLoading: isUserLoading || isMembersLoading, members };
};
