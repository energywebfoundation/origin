import { useRegisterDeviceFormLogic } from '@energyweb/origin-ui-device-logic';
import {
  useAllDeviceTypes,
  useAllDeviceFuelTypes,
  useApiRegisterDevice,
} from '@energyweb/origin-ui-device-data';

export const useRegisterPageEffects = () => {
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const { allTypes: allDeviceTypes, isLoading: areDeviceTypesLoading } =
    useAllDeviceTypes();

  const formLogic = useRegisterDeviceFormLogic(
    allFuelTypes,
    allDeviceTypes,
    process.env.NX_SMART_METER_ID
  );
  const submitHandler = useApiRegisterDevice();

  const formProps = {
    ...formLogic,
    submitHandler,
  };
  const isLoading = areFuelTypesLoading || areDeviceTypesLoading;

  return { isLoading, formProps };
};
