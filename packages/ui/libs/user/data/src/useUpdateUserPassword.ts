import {
  UpdatePasswordDTO,
  useUserControllerUpdateOwnPassword,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useUser } from './useUser';

export const useApiUpdateUserAccountPassword = () => {
  const { t } = useTranslation();
  const { logout } = useUser();

  const { mutate, isLoading, error, isError, isSuccess, status } =
    useUserControllerUpdateOwnPassword();

  const submitHandler = (values: UpdatePasswordDTO) => {
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
        onError: (error: AxiosError) => {
          console.error(error);
          showNotification(
            t('user.profile.notifications.userPasswordUpdateError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler,
  };
};
