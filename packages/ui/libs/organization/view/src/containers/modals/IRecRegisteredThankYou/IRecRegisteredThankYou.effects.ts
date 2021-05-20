import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useIRecRegisteredThankYouLogic } from '@energyweb/origin-ui-organization-logic';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
  useOrgModalsStore,
} from '../../../context';

export const useIRecRegisteredThankYouEffects = () => {
  const { iRecRegisteredThankYou: open } = useOrgModalsStore();
  const dispatchModals = useOrgModalsDispatch();

  const closeModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_REGISTERED_THANK_YOU,
      payload: false,
    });
  };

  const { title, text, buttons } = useIRecRegisteredThankYouLogic(closeModal);

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { open, title, text, buttons, dialogProps };
};
