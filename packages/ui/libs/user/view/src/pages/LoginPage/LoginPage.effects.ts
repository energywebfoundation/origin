import {
  InvitationDTO,
  UserDTO,
} from '@energyweb/origin-backend-react-query-client';
import { useUserLogInFormConfig } from '@energyweb/origin-ui-user-logic';
import { useUserLogin } from '@energyweb/origin-ui-user-data';
import { useNavigate } from 'react-router';
import { UserModalsActionsEnum, useUserModalsDispatch } from '../../context';

export const useLogInPageEffects = () => {
  const navigate = useNavigate();
  const dispatchModals = useUserModalsDispatch();

  const openRegisterOrgModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_LOGIN_REGISTER_ORG,
      payload: true,
    });
  };

  const openInvitationModal = (invitation: InvitationDTO, user: UserDTO) => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_PENDING_INVITATION,
      payload: {
        open: true,
        invitation,
        user,
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
  const formProps = useUserLogInFormConfig(submitHandler);

  const navigateToResetPassword = () => {
    navigate('/login/request-password-reset');
  };

  const navigateToRegister = () => {
    navigate('/auth/register');
  };

  return { formProps, navigateToResetPassword, navigateToRegister };
};
