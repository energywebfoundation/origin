import { useApiAdminUpdateUser } from '@energyweb/origin-ui-user-data-access';
import { useAdminUserUpdateFormConfig } from '@energyweb/origin-ui-user-logic';

export const useAdminUpdateUserPageEffects = (userId: number) => {
  const { submitHandler } = useApiAdminUpdateUser(userId);
  const formConfig = useAdminUserUpdateFormConfig(submitHandler);
  return { formConfig };
};
