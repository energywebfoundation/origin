import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useIRecAccountRegisteredLogic } from '@energyweb/origin-ui-organization-logic';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
  useOrgModalsStore,
} from '../../../context';

export const useIRecAccountRegisteredEffects = () => {
  const { iRecAccountRegistered: open } = useOrgModalsStore();
  const dispatchModals = useOrgModalsDispatch();

  const closeModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_ACCOUNT_REGISTERED,
      payload: false,
    });
    // show notification and show next modal
  };

  const { title, text, buttons } = useIRecAccountRegisteredLogic(closeModal);

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { open, title, text, buttons, dialogProps };
};
