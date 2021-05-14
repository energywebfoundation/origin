import { useUserControllerUpdateOwnPassword } from '@energyweb/origin-backend-react-query-client';
import { UnpackNestedValue } from 'react-hook-form';
import { TUserResetPasswordFormValues } from '@energyweb/origin-ui-user-logic';
import { useCallback } from 'react';

export const useApiUpdateUserAccountPassword = () => {
  const {
    isLoading,
    error,
    isError,
    isSuccess,
    status,
  } = useUserControllerUpdateOwnPassword();

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler: useCallback(
      (values: UnpackNestedValue<TUserResetPasswordFormValues>): void => {
        console.log('useApiUpdateUserAccountPassword => success');
      },
      []
    ),
  };
};
