import { useUserResetPasswordFormConfig } from '@energyweb/origin-ui-user-logic';
import { useApiResetPassword } from '@energyweb/origin-ui-user-data-access';

export const useResetPasswordPageEffects = () => {
  const { submitHandler } = useApiResetPassword();
  const formConfig = useUserResetPasswordFormConfig(submitHandler);
  return { formConfig };
};
