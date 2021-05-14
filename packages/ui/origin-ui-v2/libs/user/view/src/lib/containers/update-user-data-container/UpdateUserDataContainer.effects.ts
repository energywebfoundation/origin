import { useApiUpdateUserAccountData } from '@energyweb/origin-ui-user-data-access';
import { useUpdateUserAccountDataFormConfig } from '@energyweb/origin-ui-user-logic';
import { IUser } from '@energyweb/origin-backend-core';

export const useUpdateUserDataContainerEffects = (initialUserData: IUser) => {
  const { submitHandler } = useApiUpdateUserAccountData();
  const formConfig = useUpdateUserAccountDataFormConfig(
    initialUserData,
    submitHandler
  );
  return { formConfig };
};
