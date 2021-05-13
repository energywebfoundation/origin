import { prepareDeviceSpecsForCard } from '@energyweb/origin-ui-device-logic';
import { useTranslation } from 'react-i18next';

type TUseDeviceCardEffectsArgs = {
  device: any;
};

export const useDeviceCardEffects = ({ device }: TUseDeviceCardEffectsArgs) => {
  const { t } = useTranslation();

  const { specsData, iconsData } = prepareDeviceSpecsForCard({ t, device });
  const hoverText = t('device.card.hoverText').toUpperCase();

  return { specsData, iconsData, hoverText };
};
