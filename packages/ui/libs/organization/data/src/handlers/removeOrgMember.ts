import {
  getOrganizationControllerGetUsersQueryKey,
  useOrganizationControllerRemoveMember,
  UserDTO,
  useUserControllerMe,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useOrganizationMemberRemove = () => {
  const { data: user, isLoading } = useUserControllerMe();
  const organizationId = user?.organization?.id;

  const { t } = useTranslation();
  const { mutate } = useOrganizationControllerRemoveMember();

  const queryClient = useQueryClient();
  const orgMembersKey =
    getOrganizationControllerGetUsersQueryKey(organizationId);

  const removeHandler = (userToDeleteId: UserDTO['id']) => {
    if (userToDeleteId === user?.id) {
      showNotification(
        t('organization.members.notifications.cantRemoveYourself'),
        NotificationTypeEnum.Error
      );
      return;
    }

    mutate(
      { id: organizationId, memberId: userToDeleteId },
      {
        onSuccess: () => {
          showNotification(
            t('organization.members.notifications.removeSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(orgMembersKey);
        },
        onError: (error: any) => {
          showNotification(
            `${t('organization.members.notifications.removeError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { removeHandler, isLoading };
};
