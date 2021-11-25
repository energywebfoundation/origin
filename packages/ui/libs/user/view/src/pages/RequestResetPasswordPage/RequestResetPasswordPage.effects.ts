import { useCallback, useMemo } from 'react';
import {
  RequestResetPasswordFormValues,
  useRequestResetPasswordFormLogic,
} from '@energyweb/origin-ui-user-logic';
import { GenericFormProps } from '@energyweb/origin-ui-core';

export const useRequestResetPasswordPageEffects = () => {
  const formLogic = useRequestResetPasswordFormLogic();

  // add proper when api is ready
  const submitHandler = useCallback(() => {}, []);

  const formProps: GenericFormProps<RequestResetPasswordFormValues> = useMemo(
    () => ({ ...formLogic, submitHandler }),
    [formLogic, submitHandler]
  );

  return {
    formProps,
  };
};
