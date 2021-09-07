import {
  useUserControllerRegister,
  RegisterUserDTO,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

type TRegisterUserFormValues = {
  title: string;
  titleInput?: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
};

export const useApiRegisterUser = (showRegisteredModal: () => void) => {
  const { t } = useTranslation();

  const {
    mutate,
    status,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useUserControllerRegister();

  const submitHandler = (values: TRegisterUserFormValues) => {
    const data: RegisterUserDTO = {
      title: values.title === 'Other' ? values.titleInput : values.title,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      telephone: values.telephone,
      password: values.password,
    };
    mutate(
      { data },
      {
        onSuccess: () => {
          showNotification(
            t('user.register.notifications.registerSuccess'),
            NotificationTypeEnum.Success
          ),
            showRegisteredModal();
        },
        onError: () => {
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
