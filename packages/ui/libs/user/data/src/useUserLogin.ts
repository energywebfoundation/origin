import {
  LoginDataDTO,
  useAppControllerLogin,
} from '@energyweb/origin-backend-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { setAuthenticationToken } from '@energyweb/origin-ui-shared-state';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export const useUserLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutate } = useAppControllerLogin();

  return (values: LoginDataDTO) => {
    mutate(
      { data: values },
      {
        onSuccess: ({ accessToken }) => {
          setAuthenticationToken(accessToken);
          navigate('/');
          window.location.reload();
        },
        onError: (error: AxiosError) => {
          console.error(error);
          showNotification(
            t('user.login.notifications.loginError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };
};
