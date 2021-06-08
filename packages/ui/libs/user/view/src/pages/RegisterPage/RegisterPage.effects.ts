import { useUserSignInFormConfig } from '@energyweb/origin-ui-user-logic';
import { useApiRegisterUser } from '@energyweb/origin-ui-user-data-access';
import { UserModalsActionsEnum, useUserModalsDispatch } from '../../context';

export const useRegisterPageEffects = () => {
  const dispatchModals = useUserModalsDispatch();

  const openUserRegisteredModal = () =>
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_USER_REGISTERED,
      payload: true,
    });

  const { submitHandler } = useApiRegisterUser(openUserRegisteredModal);
  const formConfig = useUserSignInFormConfig(submitHandler);

  return { formConfig };
};
