import {
  getUserControllerMeQueryKey,
  UserDTO,
  UserStatus,
  useUserControllerUpdateOwnPassword,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useUser } from '../fetching';

export type TUpdateUserPasswordFormValues = {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export const useApiUpdateUserAccountPassword = () => {
  const { t } = useTranslation();
  const { logout } = useUser();
  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();

  const { mutate } = useUserControllerUpdateOwnPassword();

  const submitHandler = (values: TUpdateUserPasswordFormValues) => {
    const user: UserDTO = queryClient.getQueryData(userQueryKey);
    const { status } = user;
    if (status !== UserStatus.Active) {
      showNotification(
        t('user.profile.notifications.onlyActiveUserCan', {
          status: user.status,
        }),
        NotificationTypeEnum.Error
      );
      return;
    }
    mutate(
      { data: values },
      {
        onSuccess: () => {
          showNotification(
            t('user.profile.notifications.userPasswordUpdateSuccess'),
            NotificationTypeEnum.Success
          );
          logout();
        },
        onError: (error: any) => {
          showNotification(
            `${t('user.profile.notifications.userPasswordUpdateError')}:
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
