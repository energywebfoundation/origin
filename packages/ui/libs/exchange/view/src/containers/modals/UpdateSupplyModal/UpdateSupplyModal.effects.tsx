import { useApiUpdateSupplyHandler } from '@energyweb/origin-ui-exchange-data';
import { UpdateSupplyFormLogic } from '@energyweb/origin-ui-exchange-logic';
import {
  ExchangeModalsActionsEnum,
  useExchangeModalsStore,
  useExchangeModalsDispatch,
} from '../../../context';

export const useUpdateSupplyModalEffects = () => {
  const { updateSupply } = useExchangeModalsStore();

  const dispatchModals = useExchangeModalsDispatch();
  const isOpen = updateSupply?.open;

  const handleModalClose = () => {
    dispatchModals({
      type: ExchangeModalsActionsEnum.SHOW_UPDATE_SUPPLY,
      payload: {
        open: false,
        deviceWithSupply: null,
      },
    });
  };

  const formLogic = UpdateSupplyFormLogic(
    handleModalClose,
    updateSupply?.deviceWithSupply
  );
  const submitHandler = useApiUpdateSupplyHandler(
    updateSupply?.deviceWithSupply,
    handleModalClose
  );
  const formProps = {
    ...formLogic,
    submitHandler,
  };

  return { formProps, isOpen, handleModalClose };
};
