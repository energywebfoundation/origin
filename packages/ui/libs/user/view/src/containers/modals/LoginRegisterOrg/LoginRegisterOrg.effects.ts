import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useLoginRegisterOrgModalLogic } from '@energyweb/origin-ui-user-logic';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import {
  UserModalsActionsEnum,
  useUserModalsDispatch,
  useUserModalsStore,
} from '../../../context';

export const useLoginRegisterOrgEffects = () => {
  const { loginRegisterOrg: open } = useUserModalsStore();
  const dispatchModals = useUserModalsDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const closeModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_LOGIN_REGISTER_ORG,
      payload: false,
    });
    queryClient.resetQueries();
    navigate('/');
  };

  const navigateToRegister = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_LOGIN_REGISTER_ORG,
      payload: false,
    });
    queryClient.resetQueries();
    navigate('/organization/register');
  };

  const { title, text, buttons } = useLoginRegisterOrgModalLogic(
    closeModal,
    navigateToRegister
  );

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { title, text, buttons, open, dialogProps };
};
