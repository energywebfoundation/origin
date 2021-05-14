import { useApiUpdateUserAccountData } from '@energyweb/origin-ui-user-data-access';
import { useUpdateUserAccountDataFormConfig } from '@energyweb/origin-ui-user-logic';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

export const useUpdateUserDataContainerEffects = (initialUserData: UserDTO) => {
  const { submitHandler } = useApiUpdateUserAccountData();
  const formConfig = useUpdateUserAccountDataFormConfig(
    initialUserData,
    submitHandler
  );
  return { formConfig };
};
