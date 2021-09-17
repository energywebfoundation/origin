import { getUserControllerMeQueryKey } from '@energyweb/origin-backend-react-query-client';
import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useRegisterThankYouLogic } from '@energyweb/origin-ui-organization-logic';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import {
  OrganizationModalsActionsEnum,
  useOrgModalsDispatch,
  useOrgModalsStore,
} from '../../../context';

export const useRegisterThankYouEffects = () => {
  const { registerThankYou: open } = useOrgModalsStore();
  const dispatchModals = useOrgModalsDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userKey = getUserControllerMeQueryKey();

  const closeModal = () => {
    dispatchModals({
      type: OrganizationModalsActionsEnum.SHOW_REGISTER_THANK_YOU,
      payload: false,
    });
    navigate('/organization/my');
    queryClient.invalidateQueries(userKey);
  };

  const { title, text, buttons } = useRegisterThankYouLogic(closeModal);

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { title, text, buttons, open, dialogProps };
};
