import { GenericModalProps } from '@energyweb/origin-ui-core';
import { usePendingInvitationModalHandlers } from '@energyweb/origin-ui-user-data';
import { usePendingInvitationModalLogic } from '@energyweb/origin-ui-user-logic';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import {
  UserModalsActionsEnum,
  useUserModalsDispatch,
  useUserModalsStore,
} from '../../../context';

export const usePendingInvitationEffects = () => {
  const {
    pendingInvitation: { open, invitation, user },
  } = useUserModalsStore();
  const dispatchModals = useUserModalsDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const closeModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_PENDING_INVITATION,
      payload: { open: false, invitation: null, user: null },
    });
    queryClient.resetQueries();
    navigate('/');
  };

  const openRoleChangeModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_ROLE_CHANGED,
      payload: { open: true, user },
    });
  };

  const { acceptHandler, declineHandler, laterHandler } =
    usePendingInvitationModalHandlers(closeModal, openRoleChangeModal);

  const { title, text, buttons } = usePendingInvitationModalLogic({
    invitation,
    acceptHandler,
    declineHandler,
    laterHandler,
  });

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { title, text, buttons, open, dialogProps };
};
