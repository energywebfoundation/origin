import { useUpdateUserAccountPasswordFormConfig } from '@energyweb/origin-ui-user-logic';
import { useApiUpdateUserAccountPassword } from '@energyweb/origin-ui-user-data';

export const useUpdateUserPasswordEffects = () => {
  const { submitHandler } = useApiUpdateUserAccountPassword();
  const formConfig = useUpdateUserAccountPasswordFormConfig();

  const formProps = {
    ...formConfig,
    submitHandler,
  };

  return { formProps };
};
