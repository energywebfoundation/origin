import { useUserControllerRegister } from '@energyweb/origin-backend-react-query-client';
import { UnpackNestedValue } from 'react-hook-form';
import { TUserSignInFormValues } from '@energyweb/origin-ui-user-logic';

export const useApiRegisterUser = () => {
  const {
    mutateAsync,
    status,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useUserControllerRegister();

  return {
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    submitHandler(values: UnpackNestedValue<TUserSignInFormValues>): void {
      mutateAsync({ data: values }).then((value) => {});
    },
  };
};
