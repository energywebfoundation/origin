import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useUserRegisteredModalLogic } from '@energyweb/origin-ui-user-logic';
import { useNavigate } from 'react-router';
import {
  useUserModalsStore,
  useUserModalsDispatch,
  UserModalsActionsEnum,
} from '../../../context';

export const useUserRegisteredEffects = () => {
  const { userRegistered: open } = useUserModalsStore();
  const dispatchModals = useUserModalsDispatch();
  const navigate = useNavigate();

  const closeModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_USER_REGISTERED,
      payload: false,
    });
    navigate('/auth/login');
  };

  const { title, text, buttons } = useUserRegisteredModalLogic(closeModal);

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { title, text, buttons, open, dialogProps };
};
