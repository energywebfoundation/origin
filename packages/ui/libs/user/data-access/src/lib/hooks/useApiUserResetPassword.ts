import { useUserControllerUpdateOwnPassword } from '@energyweb/origin-backend-react-query-client';
import { UnpackNestedValue } from 'react-hook-form';
import { TUserResetPasswordFormValues } from '@energyweb/origin-ui-user-logic';
import { useCallback } from 'react';

export const useApiUserResetPassword = () => {
  const {
    isLoading,
    error,
    isError,
    isSuccess,
    status,
    // here should be reset controller
  } = useUserControllerUpdateOwnPassword();

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler: useCallback(
      (values: UnpackNestedValue<TUserResetPasswordFormValues>): void => {
        throw new Error('not impmpemented yet :(');
      },
      []
    ),
  };
};
