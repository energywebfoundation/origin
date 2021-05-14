import { useAdminControllerUpdateUser } from '@energyweb/origin-backend-react-query-client';
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
  } = useAdminControllerUpdateUser();

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
