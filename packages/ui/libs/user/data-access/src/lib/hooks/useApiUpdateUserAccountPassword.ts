import {
  getUserControllerMeQueryKey,
  UpdatePasswordDTO,
  useUserControllerUpdateOwnPassword,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';

export const useApiUpdateUserAccountPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userQueryKey = getUserControllerMeQueryKey();

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
          ),
            queryClient.removeQueries(userQueryKey);
          localStorage.removeItem('AUTHENTICATION_TOKEN');
          navigate('/');
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
