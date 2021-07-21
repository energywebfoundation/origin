import { useApiUpdateSupplyHandler } from '@energyweb/origin-ui-exchange-data';
import { UpdateSupplyFormLogic } from '@energyweb/origin-ui-exchange-logic';
import {
  UpdateSupplyModalActionsEnum,
  useSupplyUpdateModalStore,
  useSupplyUpdateModalDispatch,
} from '../../../context';

export const useUpdateSupplyModalEffects = () => {
  const { updateSupply } = useSupplyUpdateModalStore();

  const dispatchModals = useSupplyUpdateModalDispatch();
  const isOpen = updateSupply?.open;

  const handleModalClose = () => {
    dispatchModals({
      type: UpdateSupplyModalActionsEnum.SHOW_UPDATE_SUPPLY,
      payload: {
        open: false,
        deviceWithSupply: null,
      },
    });
  };

  const formLogic = UpdateSupplyFormLogic(
    handleModalClose,
    updateSupply.deviceWithSupply
  );
  const submitHandler = useApiUpdateSupplyHandler(
    updateSupply.deviceWithSupply,
    handleModalClose
  );
  const formProps = {
    ...formLogic,
    submitHandler,
  };

  return { formProps, isOpen, handleModalClose };
};
