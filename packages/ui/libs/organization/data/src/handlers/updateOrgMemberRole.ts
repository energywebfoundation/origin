import { Role } from '@energyweb/origin-backend-core';
import {
  getOrganizationControllerGetUsersQueryKey,
  useOrganizationControllerChangeMemberRole,
  UserDTO,
  useUserControllerMe,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useOrganizationMemberRoleUpdate = () => {
  const { t } = useTranslation();
  const { mutate } = useOrganizationControllerChangeMemberRole();
  const { data: userUpdating } = useUserControllerMe();

  const queryClient = useQueryClient();
  const membersKey = getOrganizationControllerGetUsersQueryKey(
    userUpdating?.organization?.id
  );

  const updateRoleHandler = (userToUpdateId: UserDTO['id'], newRole: Role) => {
    mutate(
      {
        id: userUpdating.organization.id,
        userId: userToUpdateId,
        data: {
          role: newRole,
        },
      },
      {
        onSuccess: () => {
          showNotification(
            t('organization.members.notifications.roleChangeSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(membersKey);
        },
        onError: (error: any) => {
          showNotification(
            `${t('organization.members.notifications.roleChangeError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return updateRoleHandler;
};
