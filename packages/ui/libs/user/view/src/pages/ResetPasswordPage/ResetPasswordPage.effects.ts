import { GenericFormProps } from '@energyweb/origin-ui-core';
import {
  ResetPasswordFormValues,
  useResetPasswordHandler,
} from '@energyweb/origin-ui-user-data';
import { useResetPasswordFormLogic } from '@energyweb/origin-ui-user-logic';
import { useQueryString } from '@energyweb/origin-ui-utils';
import { useMemo, useState } from 'react';

export const useResetPasswordPageEffects = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);

  const parsedQuery = useQueryString();
  const token = parsedQuery.token as string;

  const { resetHandler: submitHandler, isMutating } =
    useResetPasswordHandler(token);

  const formLogic = useResetPasswordFormLogic({
    passwordVisible,
    setPasswordVisible,
    passwordConfirmVisible,
    setPasswordConfirmVisible,
    isMutating,
  });

  const formProps: GenericFormProps<ResetPasswordFormValues> = useMemo(
    () => ({ ...formLogic, submitHandler }),
    [formLogic, submitHandler]
  );

  return { formProps };
};
