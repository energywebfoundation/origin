// import { useSpecsForAllDeviceCard } from '@energyweb/origin-ui-device-logic';
import { useTranslation } from 'react-i18next';

type TUsePublicDeviceCardEffectsArgs = {
  device: any;
};

export const usePublicDeviceCardEffects = ({
  device,
}: TUsePublicDeviceCardEffectsArgs) => {
  const { t } = useTranslation();

  // const { specsData, iconsData } = useSpecsForAllDeviceCard({ device });
  const hoverText = t('device.card.hoverText').toUpperCase();

  // return { specsData, iconsData, hoverText };
};
