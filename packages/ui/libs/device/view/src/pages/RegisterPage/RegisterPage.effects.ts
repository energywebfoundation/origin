import { useTranslation } from 'react-i18next';
import { createRegisterDeviceForm } from '@energyweb/origin-ui-device-logic';

export const useRegisterPageEffects = () => {
  const { t } = useTranslation();

  // Mock
  const externalDeviceId = 'Smart Meter Readings API ID';

  return createRegisterDeviceForm(t, externalDeviceId);
};
