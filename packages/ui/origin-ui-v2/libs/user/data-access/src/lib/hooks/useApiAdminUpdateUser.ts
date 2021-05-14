import { originBackendClient } from '@energy-web/origin-ui-api-clients';
import { UnpackNestedValue } from 'react-hook-form';
import { TAdminUserUpdateFormValues } from '@energyweb/origin-ui-user-logic';
import { useCallback } from 'react';

export const useApiAdminUpdateUser = (userId: number) => {
  const {
    mutateAsync,
    isLoading,
    error,
    isError,
    isSuccess,
    status,
  } = originBackendClient.useAdminControllerUpdateUser();

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler: useCallback(
      async (values: UnpackNestedValue<TAdminUserUpdateFormValues>) => {
        return mutateAsync({ id: userId, data: values }).then((value) => {
          console.log('useApiLogInUser => success');
        });
      },
      [userId]
    ),
  };
};
