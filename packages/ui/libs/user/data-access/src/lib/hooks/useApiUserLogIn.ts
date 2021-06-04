import { useAuthDispatchSetTokenValue } from '@energyweb/origin-ui-react-query-providers';
import {
  getInvitationControllerGetInvitationsQueryKey,
  getUserControllerMeQueryKey,
  userControllerMe,
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
import { useQueryClient } from 'react-query';
import {
  getAccountBalanceControllerGetQueryKey,
  getAccountControllerGetAccountQueryKey,
} from '@energyweb/exchange-react-query-client';
import { getBlockchainPropertiesControllerGetQueryKey } from '@energyweb/issuer-api-react-query-client';

export type TApiLogInUserSubmitHandler = (values: LoginDataDTO) => void;

export const useApiUserLogIn = () => {
  const queryClient = useQueryClient();
  // const setTokenValue = useAuthDispatchSetTokenValue();
  // const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate, isLoading, error, isError, isSuccess, status } =
    useAppControllerLogin({
      onSuccess: ({ accessToken }) => {
        localStorage.setItem('AUTHENTICATION_TOKEN', accessToken);
        // queryClient.fetchQuery(getUserControllerMeQueryKey(), userControllerMe);
      },
      onSettled: async () => {
        await queryClient.fetchQuery(
          getUserControllerMeQueryKey(),
          userControllerMe
        );
      },
    });

  const submitHandler = (values: LoginDataDTO) => {
    mutate({ data: values });
    navigate('/');
  };

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler,
  };
  // const setTokenValue = useAuthDispatchSetTokenValue();
  // const { t } = useTranslation();
  // const navigate = useNavigate();

  // const queryClient = useQueryClient();
  // const userQueryKey = getUserControllerMeQueryKey();
  // const invitationQueryKey = getInvitationControllerGetInvitationsQueryKey();
  // const accountQueryKey = getAccountControllerGetAccountQueryKey();
  // const accountBalanceQueryKey = getAccountBalanceControllerGetQueryKey();
  // const blockchainPropsQueryKey = getBlockchainPropertiesControllerGetQueryKey();

  // const { mutate, isLoading, error, isError, isSuccess, status } =
  //   useAppControllerLogin({
  //     onSuccess: async ({ accessToken }) => {
  //       localStorage.setItem('AUTHENTICATION_TOKEN', accessToken)
  //       setTokenValue(accessToken);
  //       setAuthenticationToken(accessToken);
  //       navigate('/');
  //     },
  //     onError: (error: AxiosResponse) => {
  //       console.warn(t('user.login.notifications.loginError'), error);
  //       showNotification(
  //         t('user.login.notifications.loginError'),
  //         NotificationTypeEnum.Error
  //       );
  //     },
  //     onSettled: async () => {
  //       queryClient.fetchQuery(getUserControllerMeQueryKey(), userControllerMe);
  //   }
  //   });

  // const submitHandler = useCallback(
  //   (values: LoginDataDTO) => {
  //     mutate({ data: values });
  //   },
  //   [navigate, setAuthenticationToken, setTokenValue]
  // );
  // return {
  //   status,
  //   isLoading,
  //   isSuccess,
  //   isError,
  //   error,
  //   submitHandler,
  // };
};
