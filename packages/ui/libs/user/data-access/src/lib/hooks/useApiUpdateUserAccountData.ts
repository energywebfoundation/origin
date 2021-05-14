import { useUserControllerUpdateOwnProfile } from '@energyweb/origin-backend-react-query-client';
import { UnpackNestedValue } from 'react-hook-form';
import { TUserLoginFormValues } from '@energyweb/origin-ui-user-logic';
import { TUpdateUserDataFormValues } from '@energyweb/origin-ui-user-logic';
import { useCallback } from 'react';

export type TApiUpdateUserDataSubmitHandler = (
  values: UnpackNestedValue<TUserLoginFormValues>
) => void;

export const useApiUpdateUserAccountData = () => {
  const {
    mutateAsync,
    isLoading,
    error,
    isError,
    isSuccess,
    status,
  } = useUserControllerUpdateOwnProfile();

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler: useCallback(
      async (values: UnpackNestedValue<TUpdateUserDataFormValues>) => {
        return mutateAsync({ data: values }).then((value) => {});
      },
      []
    ),
  };
};
