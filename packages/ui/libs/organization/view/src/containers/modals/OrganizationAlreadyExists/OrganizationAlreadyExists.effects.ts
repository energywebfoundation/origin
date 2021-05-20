import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useOrganizationAlreadyExistsLogic } from '@energyweb/origin-ui-organization-logic';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
  useOrgModalsStore,
} from '../../../context';

export const useOrganizationAlreadyExistsEffects = () => {
  const { organizationAlreadyExists: open } = useOrgModalsStore();
  const dispatchModals = useOrgModalsDispatch();

  const closeModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_ORGANIZATION_ALREADY_EXISTS,
      payload: false,
    });
  };

  const { title, text, buttons } = useOrganizationAlreadyExistsLogic(
    closeModal
  );

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { open, title, text, buttons, dialogProps };
};
