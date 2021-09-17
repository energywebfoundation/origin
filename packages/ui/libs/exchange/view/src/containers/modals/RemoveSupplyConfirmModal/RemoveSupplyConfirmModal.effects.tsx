import { GenericModalProps } from '@energyweb/origin-ui-core';
import { useApiRemoveSupplyHandler } from '@energyweb/origin-ui-exchange-data';
import { useRemoveSupplyConfirmLogic } from '@energyweb/origin-ui-exchange-logic';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsStore,
  useExchangeModalsDispatch,
} from '../../../context';
import { useStyles } from './RemoveSupplyConfirmModal.styles';

export const useRemoveSupplyConfirmModalEffects = () => {
  const classes = useStyles();
  const { removeSupply } = useExchangeModalsStore();
  const dispatchModals = useExchangeModalsDispatch();

  const { removeSupplyHandler } = useApiRemoveSupplyHandler();

  const closeModal = () => {
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_REMOVE_SUPPLY,
      payload: {
        open: false,
        supplyId: null,
      },
    });
  };

  const submitHandler = () => {
    removeSupplyHandler(removeSupply?.supplyId, closeModal);
  };

  const open = removeSupply?.open;

  const { title, text, buttons } = useRemoveSupplyConfirmLogic(
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
