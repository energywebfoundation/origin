import { useRegisterDeviceFormLogic } from '@energyweb/origin-ui-device-logic';
import {
  useAllDeviceTypes,
  useAllDeviceFuelTypes,
  useApiRegisterDevice,
  useApiRegionsConfiguration,
} from '@energyweb/origin-ui-device-data';
import { usePermissions } from '@energyweb/origin-ui-utils';
import { DeviceImagesUpload } from '../../containers';

export const useRegisterPageEffects = () => {
  const { canAccessPage } = usePermissions();
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const { allTypes: allDeviceTypes, isLoading: areDeviceTypesLoading } =
    useAllDeviceTypes();
  const { allRegions, isLoading: areRegionsLoading } =
    useApiRegionsConfiguration();

  const formsLogic = useRegisterDeviceFormLogic({
    allFuelTypes,
    allDeviceTypes,
    allRegions,
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
  const isLoading =
    areFuelTypesLoading || areDeviceTypesLoading || areRegionsLoading;

  return { isLoading, formProps, canAccessPage };
};
