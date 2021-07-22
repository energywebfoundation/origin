import { useRegisterDeviceFormLogic } from '@energyweb/origin-ui-device-logic';
import {
  useAllDeviceTypes,
  useAllDeviceFuelTypes,
  useApiRegisterDevice,
} from '@energyweb/origin-ui-device-data';
import { DeviceImagesUpload } from '../../containers';

export const useRegisterPageEffects = () => {
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const { allTypes: allDeviceTypes, isLoading: areDeviceTypesLoading } =
    useAllDeviceTypes();

  const formsLogic = useRegisterDeviceFormLogic({
    allFuelTypes,
    allDeviceTypes,
    externalDeviceId: process.env.NX_SMART_METER_ID,
  });

  const submitHandler = useApiRegisterDevice();

  const formsWithImagesUpload = formsLogic.forms.map((form) =>
    form.customStep
      ? {
          ...form,
          component: DeviceImagesUpload,
        }
      : form
  );

  const formProps = {
    ...formsLogic,
    forms: formsWithImagesUpload,
    submitHandler,
  };
  const isLoading = areFuelTypesLoading || areDeviceTypesLoading;

  return { isLoading, formProps };
};
