import { IUser } from '@energyweb/origin-backend-core';
import { useApiUpdateUserAccountEmail } from '@energyweb/origin-ui-user-data-access';
import { useUpdateUserAccountEmailFormConfig } from '@energyweb/origin-ui-user-logic';

export const useUpdateUserEmailContainerEffects = (initialUserData: IUser) => {
  const { submitHandler } = useApiUpdateUserAccountEmail();
  const formConfig = useUpdateUserAccountEmailFormConfig(
    initialUserData,
    submitHandler
  );

  return { formConfig };
};
