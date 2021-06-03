import {
  useUserControllerRegister,
  RegisterUserDTO,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

export const useApiRegisterUser = (showRegisteredModal: () => void) => {
  const { t } = useTranslation();

  const { mutate, status, isLoading, isSuccess, isError, error } =
    useUserControllerRegister();

  const submitHandler = (values: RegisterUserDTO) => {
    mutate(
      { data: values },
      {
        onSuccess: () => {
          showNotification(
            t('user.register.notifications.registerSuccess'),
            NotificationTypeEnum.Success
          ),
            showRegisteredModal();
        },
        onError: (error: AxiosError) => {
          console.log(error);
          showNotification(
            t('user.register.notifications.registerError'),
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
