import {
  useOrganizationControllerGetUsers,
  useUserControllerMe,
} from '@energyweb/origin-backend-react-query-client';

export const useOrganizationMembersData = () => {
  const { data: user } = useUserControllerMe();
  const { isLoading, data: members } = useOrganizationControllerGetUsers(
    user?.organization?.id
  );

  return { isLoading, members };
};
