import { Role } from '@energyweb/origin-backend-core';
import {
  getOrganizationControllerGetUsersQueryKey,
  useOrganizationControllerChangeMemberRole,
  useOrganizationControllerGetUsers,
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

export const useOrganizationMembersData = () => {
  const { data: user, isLoading: isUserLoading } = useUserControllerMe();
  const organizationId = user?.organization?.id;

  const { isLoading: isMembersLoading, data: members } =
    useOrganizationControllerGetUsers(organizationId);

  return { isLoading: isUserLoading || isMembersLoading, members };
};

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
