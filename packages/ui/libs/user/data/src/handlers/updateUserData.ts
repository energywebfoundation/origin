import {
  getUserControllerMeQueryKey,
  UserDTO,
  UserStatus,
  useUserControllerUpdateOwnProfile,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { UseFormReset } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export type TUpdateUserDataFormValues = {
  firstName: UserDTO['firstName'];
  lastName: UserDTO['lastName'];
  telephone: UserDTO['telephone'];
  status: UserDTO['status'];
  kycStatus: UserDTO['kycStatus'];
};

export const useApiUpdateUserAccountData = () => {
  const { t } = useTranslation();

  const { mutate } = useUserControllerUpdateOwnProfile();

  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();

  const submitHandler = (
    values: TUpdateUserDataFormValues,
    resetForm: UseFormReset<TUpdateUserDataFormValues>
  ) => {
    const user: UserDTO = queryClient.getQueryData(userQueryKey);
    const { email, status } = user;

    if (status !== UserStatus.Active) {
      return showNotification(
        t('user.profile.notifications.onlyActiveUserCan', {
          status: user.status,
        }),
        NotificationTypeEnum.Error
      );
    }

    mutate(
      { data: { ...values, email } },
      {
        onSuccess: () => {
          showNotification(
            t('user.profile.notifications.userInfoUpdateSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.resetQueries(userQueryKey);
          resetForm();
        },
        onError: (error: any) => {
          showNotification(
            `${t('user.profile.notifications.userInfoUpdateError')}:
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
