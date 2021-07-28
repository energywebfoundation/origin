import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useRemoveOrderConfirmLogic } from '@energyweb/origin-ui-exchange-logic';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsStore,
  useExchangeModalsDispatch,
} from '../../../context';
import { useStyles } from './RemoveOrderConfirm.styles';

export const useRemoveOrderConfirmEffects = () => {
  const classes = useStyles();
  const { removeOrder } = useExchangeModalsStore();
  const dispatchModals = useExchangeModalsDispatch();
  const { open, id, removeHandler } = removeOrder;

  const closeModal = () => {
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_REMOVE_ORDER_CONFIRM,
      payload: {
        open: false,
        id: null,
        removeHandler: null,
      },
    });
  };

  const submitHandler = () => {
    removeHandler(id, closeModal);
  };

  const { title, text, buttons } = useRemoveOrderConfirmLogic(
    closeModal,
    submitHandler
  );

  const dialogProps: GenericModalProps['dialogProps'] = {
    maxWidth: 'xs',
    classes,
  };

  return {
    open,
    title,
    text,
    buttons,
    dialogProps,
  };
};
