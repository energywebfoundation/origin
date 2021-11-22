import { GenericFormProps } from '@energyweb/origin-ui-core';
import {
  ResetPasswordFormValues,
  useResetPasswordFormLogic,
} from '@energyweb/origin-ui-user-logic';
import { useCallback, useMemo, useState } from 'react';

export const useResetPasswordPageEffects = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);

  const formLogic = useResetPasswordFormLogic({
    passwordVisible,
    setPasswordVisible,
    passwordConfirmVisible,
    setPasswordConfirmVisible,
  });

  // add proper when api is ready
  // add token read from query string as well
  const submitHandler = useCallback(() => {}, []);

  const formProps: GenericFormProps<ResetPasswordFormValues> = useMemo(
    () => ({ ...formLogic, submitHandler }),
    [formLogic, submitHandler]
  );

  return { formProps };
};
