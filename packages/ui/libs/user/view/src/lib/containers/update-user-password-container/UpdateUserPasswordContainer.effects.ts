import { useUpdateUserAccountPasswordFormConfig } from '@energyweb/origin-ui-user-logic';
import { useApiUpdateUserAccountPassword } from '@energyweb/origin-ui-user-data-access';

export const useUpdateUserPasswordContainerEffects = () => {
  const { submitHandler } = useApiUpdateUserAccountPassword();
  const formConfig = useUpdateUserAccountPasswordFormConfig(submitHandler);
  return { formConfig };
};
