import { TUseRegisterDeviceFormLogic } from './types';
import { useTranslation } from 'react-i18next';
import { createDeviceInfoForm } from './deviceInfoForm';
import { createDeviceLocationForm } from './deviceLocationForm';
import { createDeviceImagesForm } from './deviceImagesForm';

export const useRegisterDeviceFormLogic: TUseRegisterDeviceFormLogic = ({
  allFuelTypes,
  allDeviceTypes,
  allRegions,
  externalDeviceId,
}) => {
  const { t } = useTranslation();
  return {
    heading: t('device.register.formTitle'),
    forms: [
      createDeviceInfoForm(t, allFuelTypes, allDeviceTypes, externalDeviceId),
      createDeviceLocationForm(t, allRegions),
      createDeviceImagesForm(t),
    ],
    backButtonText: t('general.buttons.back'),
  };
};
