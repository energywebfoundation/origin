import { getRegistrationControllerGetRegistrationsQueryKey } from '@energyweb/origin-organization-irec-api-react-query-client';
import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useIRecRegisteredThankYouLogic } from '@energyweb/origin-ui-organization-logic';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
  useOrgModalsStore,
} from '../../../context';

export const useIRecRegisteredThankYouEffects = () => {
  const { iRecRegisteredThankYou: open } = useOrgModalsStore();
  const dispatchModals = useOrgModalsDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const iRecOrgKey = getRegistrationControllerGetRegistrationsQueryKey();

  const closeModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_IREC_REGISTERED_THANK_YOU,
      payload: false,
    });
    queryClient.invalidateQueries(iRecOrgKey);
    navigate('/organization/my');
  };

  const { title, text, buttons } = useIRecRegisteredThankYouLogic(closeModal);

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { open, title, text, buttons, dialogProps };
};
