import { GenericFormProps } from '@energyweb/origin-ui-core';
import {
  EditDeviceFormValues,
  useAllDeviceFuelTypes,
  useAllDeviceTypes,
  useDeviceDetailData,
} from '@energyweb/origin-ui-device-data';
import { useEditDeviceFormLogic } from '@energyweb/origin-ui-device-logic';
import { useParams } from 'react-router';
import {
  DeviceModalsActionsEnum,
  useDeviceModalsDispatch,
} from '../../context';

export const useEditDevicePageEffects = () => {
  const { id } = useParams();

  const dispatchModals = useDeviceModalsDispatch();

  const {
    device,
    isLoading: isDeviceLoading,
    isRefetching: isDeviceRefetching,
  } = useDeviceDetailData(id);

  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const { allTypes: allDeviceTypes, isLoading: areDeviceTypesLoading } =
    useAllDeviceTypes();

  const openConfirmModal = (values: EditDeviceFormValues) => {
    dispatchModals({
      type: DeviceModalsActionsEnum.SHOW_CONFIRM_EDIT,
      payload: {
        open: true,
        editData: values,
        device,
      },
    });
  };

  const formLogic = useEditDeviceFormLogic(
    device,
    allFuelTypes,
    allDeviceTypes
  );

  const formConfig: GenericFormProps<EditDeviceFormValues> = {
    ...formLogic,
    submitHandler: openConfirmModal,
  };

  const isLoading =
    isDeviceLoading ||
    areFuelTypesLoading ||
    areDeviceTypesLoading ||
    isDeviceRefetching;

  return { isLoading, formConfig };
};
