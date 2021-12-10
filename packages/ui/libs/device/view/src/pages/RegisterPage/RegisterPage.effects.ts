import { Countries } from '@energyweb/utils-general';
import { useRegisterDeviceFormLogic } from '@energyweb/origin-ui-device-logic';
import {
  useAllDeviceTypes,
  useAllDeviceFuelTypes,
  useApiRegisterDevice,
  useApiRegionsConfiguration,
  useApiUserAndAccount,
  useApiMyAccounts,
} from '@energyweb/origin-ui-device-data';
import { usePermissionsLogic } from '@energyweb/origin-ui-device-logic';
import { DeviceImagesUpload } from '../../containers';
import { useDeviceAppEnv } from '../../context';

export const useRegisterPageEffects = () => {
  const { smartMeterId, singleAccountMode } = useDeviceAppEnv();
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
  const { myAccounts, isLoading: areMyAccountsLoading } = useApiMyAccounts({
    enabled: singleAccountMode,
  });
  const {
    allRegions,
    country,
    isLoading: areRegionsLoading,
  } = useApiRegionsConfiguration();
  const platformCountryCode = Countries.find(
    (cntr) => cntr.name === country
  )?.code;

  const formsLogic = useRegisterDeviceFormLogic({
    allFuelTypes,
    allDeviceTypes,
    allRegions,
    myAccounts,
    externalDeviceId: smartMeterId,
    platformCountryCode,
    singleAccountMode,
  });

  const { submitHandler, isMutating } =
    useApiRegisterDevice(platformCountryCode);

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
    userAndAccountLoading ||
    areMyAccountsLoading;

  return { isLoading, isMutating, formProps, canAccessPage, requirementsProps };
};
