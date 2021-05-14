import {
  useOrganizationControllerGetUsers,
  useUserControllerMe,
} from '@energyweb/origin-backend-react-query-client';

export const useOrganizationMembersData = () => {
  const { data: userData } = useUserControllerMe();
  const user = userData?.data;

  const { isLoading, data: membersData } = useOrganizationControllerGetUsers(
    user?.organization?.id
  );
  const members = membersData?.data;

  return { isLoading, members };
};
