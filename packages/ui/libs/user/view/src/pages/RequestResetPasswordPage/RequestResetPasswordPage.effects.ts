import { useMemo } from 'react';
import { useRequestResetPasswordFormLogic } from '@energyweb/origin-ui-user-logic';
import { GenericFormProps } from '@energyweb/origin-ui-core';
import {
  RequestResetPasswordFormValues,
  useRequestPasswordResetHandler,
} from '@energyweb/origin-ui-user-data';

export const useRequestResetPasswordPageEffects = () => {
  const { requestHandler: submitHandler, isMutating } =
    useRequestPasswordResetHandler();
  const formLogic = useRequestResetPasswordFormLogic(isMutating);

  const formProps: GenericFormProps<RequestResetPasswordFormValues> = useMemo(
    () => ({ ...formLogic, submitHandler }),
    [formLogic, submitHandler]
  );

  return {
    formProps,
  };
};
