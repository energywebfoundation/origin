import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { useApiUpdateUserAccountEmail } from '@energyweb/origin-ui-user-data';
import { useUpdateUserAccountEmailFormConfig } from '@energyweb/origin-ui-user-logic';

export const useUpdateUserEmailEffects = (initialUserData: UserDTO) => {
  const { submitHandler } = useApiUpdateUserAccountEmail();
  const formConfig = useUpdateUserAccountEmailFormConfig(initialUserData);

  const formProps = {
    ...formConfig,
    submitHandler,
  };

  return { formProps };
};
