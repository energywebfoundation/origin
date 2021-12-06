import {
  useAllDeviceFuelTypes,
  useAllDeviceTypes,
  useEditDeviceHandler,
} from '@energyweb/origin-ui-device-data';
import { useEditDeviceConfirmModalLogic } from '@energyweb/origin-ui-device-logic';
import {
  DeviceModalsActionsEnum,
  useDeviceModalsDispatch,
  useDeviceModalsStore,
} from '../../../context';

export const useConfirmEditModalEffects = () => {
  const { confirmEdit } = useDeviceModalsStore();
  const dispatchModals = useDeviceModalsDispatch();
  const { open, editData, device } = confirmEdit;

  const closeModal = () => {
    dispatchModals({
      type: DeviceModalsActionsEnum.SHOW_CONFIRM_EDIT,
      payload: {
        open: false,
        device: null,
        editData: null,
      },
    });
  };

  const { submitHandler } = useEditDeviceHandler(device, closeModal);

  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const { allTypes: allDeviceTypes, isLoading: areDeviceTypesLoading } =
    useAllDeviceTypes();

  const modalConfig = useEditDeviceConfirmModalLogic({
    editData,
    submitHandler,
    cancelHandler: closeModal,
    allFuelTypes,
    allDeviceTypes,
  });

  const isLoading = areFuelTypesLoading || areDeviceTypesLoading;

  return { open, modalConfig, isLoading, notes: editData?.notes };
};
