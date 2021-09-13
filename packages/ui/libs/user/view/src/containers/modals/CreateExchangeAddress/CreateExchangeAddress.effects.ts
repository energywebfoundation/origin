import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useCreateExchangeAddressModalLogic } from '@energyweb/origin-ui-user-logic';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import {
  UserModalsActionsEnum,
  useUserModalsDispatch,
  useUserModalsStore,
} from '../../../context';

export const useCreateExchangeAddressEffects = () => {
  const { createExchangeAddress: open } = useUserModalsStore();
  const dispatchModals = useUserModalsDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const closeModal = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_CREATE_EXCHANGE_ADDRESS,
      payload: false,
    });
    queryClient.resetQueries();
    navigate('/');
  };

  const navigateToCreate = () => {
    dispatchModals({
      type: UserModalsActionsEnum.SHOW_CREATE_EXCHANGE_ADDRESS,
      payload: false,
    });
    queryClient.resetQueries();
    navigate('/account/profile');
  };

  const { title, text, buttons } = useCreateExchangeAddressModalLogic(
    closeModal,
    navigateToCreate
  );

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'sm',
  };

  return { title, text, buttons, open, dialogProps };
};
