import { useUserLogInFormConfig } from '@energyweb/origin-ui-user-logic';
import { useApiUserLogIn } from '@energyweb/origin-ui-user-data-access';

export const useLogInPageEffects = () => {
  const { submitHandler } = useApiUserLogIn();
  const formConfig = useUserLogInFormConfig(submitHandler);
  return { formConfig };
};
