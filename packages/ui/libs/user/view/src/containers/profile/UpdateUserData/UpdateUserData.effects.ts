import { useApiUpdateUserAccountData } from '@energyweb/origin-ui-user-data-access';
import {
  TUpdateUserDataFormValues,
  useUpdateUserAccountDataFormConfig,
} from '@energyweb/origin-ui-user-logic';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

export const useUpdateUserDataEffects = (user: UserDTO) => {
  const { firstName, lastName, telephone, status, kycStatus } = user;
  const initialFormData: TUpdateUserDataFormValues = {
    firstName,
    lastName,
    telephone,
    status,
    kycStatus,
  };

  const formConfig = useUpdateUserAccountDataFormConfig(initialFormData);
  const { submitHandler } = useApiUpdateUserAccountData();

  const formProps = {
    ...formConfig,
    submitHandler,
  };

  return { formProps };
};
