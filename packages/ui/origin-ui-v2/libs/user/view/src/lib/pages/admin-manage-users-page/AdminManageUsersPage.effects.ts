import { useApiAdminFetchUsers } from '@energyweb/origin-ui-user-data-access';
import { UserDTO } from '@energyweb/origin-backend-client';

export const useAdminManageUsersPageEffects = (
  handleSetEditUserData: (userDto: UserDTO) => void
) => {
  const { data, isLoading } = useApiAdminFetchUsers();
  return { data, isLoading };
};
