import { useAuthDispatchSetTokenValue } from '@energy-web/origin-ui-api-clients';
import { useAppControllerLogin } from '@energyweb/origin-backend-react-query-client';
import { UnpackNestedValue } from 'react-hook-form';
import { TUserLoginFormValues } from '@energyweb/origin-ui-user-logic';
import { useCallback } from 'react';
import { setAuthenticationToken } from '@energyweb/origin-ui-shared-state';
import { useNavigate } from 'react-router';

export type TApiLogInUserSubmitHandler = (
  values: UnpackNestedValue<TUserLoginFormValues>
) => void;

export const useApiUserLogIn = () => {
  const setTokenValue = useAuthDispatchSetTokenValue();
  const navigate = useNavigate();

  const {
    mutateAsync,
    isLoading,
    error,
    isError,
    isSuccess,
    status,
  } = useAppControllerLogin();

  const submitHandler: TApiLogInUserSubmitHandler = useCallback(
    (values: UnpackNestedValue<TUserLoginFormValues>) => {
      mutateAsync({ data: values }).then((value) => {
        setTokenValue(value.accessToken);
        setAuthenticationToken(value.accessToken);
        navigate('/');
      });
    },
    [navigate, setAuthenticationToken, setTokenValue]
  );
  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler: submitHandler,
  };
};
