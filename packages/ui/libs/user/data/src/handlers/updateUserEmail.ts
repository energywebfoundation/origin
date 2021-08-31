import {
  getUserControllerMeQueryKey,
  UpdateUserProfileDTO,
  UserDTO,
  UserStatus,
  useUserControllerUpdateOwnProfile,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useUser } from '../fetching';

export const useApiUpdateUserAccountEmail = () => {
  const { mutate } = useUserControllerUpdateOwnProfile();
  const { logout } = useUser();

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();

  const submitHandler = (
    values: Pick<UpdateUserProfileDTO, 'email'>,
    resetForm: any
  ) => {
    const user: UserDTO = queryClient.getQueryData(userQueryKey);
    const { firstName, lastName, telephone, status } = user;
    const restUserProps = { firstName, lastName, telephone };

    if (status !== UserStatus.Active) {
      showNotification(
        t('user.profile.notifications.onlyActiveUserCan', {
          status: user.status,
        }),
        NotificationTypeEnum.Error
      );
      return;
    }

    return mutate(
      { data: { ...values, ...restUserProps } },
      {
        onSuccess: () => {
          showNotification(
            t('user.profile.notifications.userEmailUpdateSuccess'),
            NotificationTypeEnum.Success
          ),
            resetForm();
          logout();
        },
        onError: (error: any) => {
          showNotification(
            `${t('user.profile.notifications.userEmailUpdateError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return {
    submitHandler,
  };
};
