import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { useApiUpdateUserAccountEmail } from '@energyweb/origin-ui-user-data-access';
import { useUpdateUserAccountEmailFormConfig } from '@energyweb/origin-ui-user-logic';

export const useUpdateUserEmailContainerEffects = (
  initialUserData: UserDTO
) => {
  const { submitHandler } = useApiUpdateUserAccountEmail();
  const formConfig = useUpdateUserAccountEmailFormConfig(
    initialUserData,
    submitHandler
  );

  return { formConfig };
};
