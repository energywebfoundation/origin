import { useAuthDispatchSetTokenValue } from '@energyweb/origin-ui-react-query-providers';
import {
  LoginDataDTO,
  useAppControllerLogin,
} from '@energyweb/origin-backend-react-query-client';
import { useCallback } from 'react';
import { setAuthenticationToken } from '@energyweb/origin-ui-shared-state';
import { useNavigate } from 'react-router';
import { AxiosResponse } from 'axios';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';

export type TApiLogInUserSubmitHandler = (values: LoginDataDTO) => void;

export const useApiUserLogIn = () => {
  const setTokenValue = useAuthDispatchSetTokenValue();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate, isLoading, error, isError, isSuccess, status } =
    useAppControllerLogin();

  const submitHandler = useCallback(
    (values: LoginDataDTO) => {
      mutate(
        { data: values },
        {
          onSuccess: ({ accessToken }) => {
            setTokenValue(accessToken);
            setAuthenticationToken(accessToken);
            navigate('/');
          },
          onError: (error: AxiosResponse) => {
            console.warn(t('user.login.notifications.loginError'), error);
            showNotification(
              t('user.login.notifications.loginError'),
              NotificationTypeEnum.Error
            );
          },
        }
      );
    },
    [navigate, setAuthenticationToken, setTokenValue]
  );
  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler,
  };
};
