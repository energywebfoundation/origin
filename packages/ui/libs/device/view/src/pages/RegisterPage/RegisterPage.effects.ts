import { useRegisterDeviceFormLogic } from '@energyweb/origin-ui-device-logic';
import {
  useAllDeviceTypes,
  useAllDeviceFuelTypes,
  useApiRegisterDevice,
  useApiRegionsConfiguration,
  useApiUserAndAccount,
} from '@energyweb/origin-ui-device-data';
import { usePermissionsLogic } from '@energyweb/origin-ui-device-logic';
import { DeviceImagesUpload } from '../../containers';
import { useDeviceAppEnv } from '../../context';

export const useRegisterPageEffects = () => {
  const { smartMeterId } = useDeviceAppEnv();
  const {
    user,
    exchangeDepositAddress,
    isLoading: userAndAccountLoading,
  } = useApiUserAndAccount();
  const { canAccessPage, requirementsProps } = usePermissionsLogic({
    user,
    exchangeDepositAddress,
  });

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
    externalDeviceId: smartMeterId,
  });

  const { submitHandler, isMutating } = useApiRegisterDevice();

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
    areFuelTypesLoading ||
    areDeviceTypesLoading ||
    areRegionsLoading ||
    userAndAccountLoading;

  return { isLoading, isMutating, formProps, canAccessPage, requirementsProps };
};
