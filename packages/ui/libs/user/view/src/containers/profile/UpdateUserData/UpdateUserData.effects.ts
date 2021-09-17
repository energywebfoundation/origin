import { useApiUpdateUserAccountData } from '@energyweb/origin-ui-user-data';
import { useUpdateUserAccountDataFormConfig } from '@energyweb/origin-ui-user-logic';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

export const useUpdateUserDataEffects = (user: UserDTO) => {
  const formConfig = useUpdateUserAccountDataFormConfig(user);
  const { submitHandler } = useApiUpdateUserAccountData();

  const formProps = {
    ...formConfig,
    submitHandler,
  };

  return { formProps };
};
