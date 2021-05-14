import { useUserSignInFormConfig } from '@energyweb/origin-ui-user-logic';
import { useApiRegisterUser } from '@energyweb/origin-ui-user-data-access';

export const useSignInPageEffects = () => {
  const { submitHandler } = useApiRegisterUser();
  const formConfig = useUserSignInFormConfig(submitHandler);
  return { formConfig };
};
