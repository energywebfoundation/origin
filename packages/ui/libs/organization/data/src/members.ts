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
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useOrganizationMembersData = () => {
  const { data: user } = useUserControllerMe();
  const organizationId = user?.organization?.id;

  const { isLoading, data: members } = useOrganizationControllerGetUsers(
    organizationId
  );

  return { isLoading, members };
};

export const useOrganizationMemberRemove = () => {
  const { data: user } = useUserControllerMe();
  const organizationId = user?.organization?.id;

  const { t } = useTranslation();
  const { mutate } = useOrganizationControllerRemoveMember();

  const queryClient = useQueryClient();
  const orgMembersKey = getOrganizationControllerGetUsersQueryKey(
    organizationId
  );

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
        onError: (error) => {
          console.error(error);
          showNotification(
            t('organization.members.notifications.removeError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return removeHandler;
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
        onError: (error: AxiosError) => {
          console.error(error);
          if (error?.response?.data?.message) {
            showNotification(
              error?.response?.data?.message,
              NotificationTypeEnum.Error
            );
          } else {
            showNotification(
              t('organization.members.notifications.roleChangeError'),
              NotificationTypeEnum.Success
            );
          }
        },
      }
    );
  };

  return updateRoleHandler;
};
