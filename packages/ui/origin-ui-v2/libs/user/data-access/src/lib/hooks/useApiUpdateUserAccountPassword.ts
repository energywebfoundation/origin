import { originBackendClient } from '@energy-web/origin-ui-api-clients';
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
  } = originBackendClient.useUserControllerUpdateOwnPassword();

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
