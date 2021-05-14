import { useUserControllerUpdateOwnProfile } from '@energyweb/origin-backend-react-query-client';
import { UnpackNestedValue } from 'react-hook-form';
import { TUpdateUserDataFormValues } from '@energyweb/origin-ui-user-logic';
import { useCallback } from 'react';
import { TUpdateUserEmailFormValues } from '../../../../logic/src/lib/form/hooks/useUpdateUserAccountEmailFormConfig';

export type TApiUpdateUserEmailSubmitHandler = (
  values: UnpackNestedValue<TUpdateUserEmailFormValues>
) => void;

export const useApiUpdateUserAccountEmail = () => {
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
        return mutateAsync({ data: values }).then((value) => {
          console.log('useUserControllerUpdateOwnProfile => success');
        });
      },
      []
    ),
  };
};
