import { GenericModalProps } from '@energyweb/origin-ui-core';
import { usePendingInvitationModalHandlers } from '@energyweb/origin-ui-user-data';
import { usePendingInvitationModalLogic } from '@energyweb/origin-ui-user-logic';
import {
  UserModalsActionsEnum,
  useUserModalsDispatch,
  useUserModalsStore,
} from '../../../context';

export const usePendingInvitationEffects = () => {
  const {
    pendingInvitation: { open, invitation },
  } = useUserModalsStore();
  const dispatchModals = useUserModalsDispatch();

  const closeModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_PENDING_INVITATION,
      payload: { open: false, invitation: null },
    });
  };

  const { acceptHandler, declineHandler, laterHandler } =
    usePendingInvitationModalHandlers(closeModal);

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
