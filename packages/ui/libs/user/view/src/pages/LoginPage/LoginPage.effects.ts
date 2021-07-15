import { useUserLogInFormConfig } from '@energyweb/origin-ui-user-logic';
import { useUserLogin } from '@energyweb/origin-ui-user-data';
import { useNavigate } from 'react-router';
import { UserModalsActionsEnum, useUserModalsDispatch } from '../../context';
import { InvitationDTO } from '@energyweb/origin-backend-react-query-client';

export const useLogInPageEffects = () => {
  const navigate = useNavigate();
  const dispatchModals = useUserModalsDispatch();

  const openRegisterOrgModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_LOGIN_REGISTER_ORG,
      payload: true,
    });
  };

  const openInvitationModal = (invitation: InvitationDTO) => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_PENDING_INVITATION,
      payload: {
        open: true,
        invitation,
      },
    });
  };

  const openExchangeAddressModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_CREATE_EXCHANGE_ADDRESS,
      payload: true,
    });
  };

  const submitHandler = useUserLogin(
    openRegisterOrgModal,
    openInvitationModal,
    openExchangeAddressModal
  );
  const formConfig = useUserLogInFormConfig(submitHandler);

  const navigateToResetPassword = () => {
    navigate('/auth/reset-password');
  };

  const navigateToRegister = () => {
    navigate('/auth/register');
  };

  return { formConfig, navigateToResetPassword, navigateToRegister };
};
