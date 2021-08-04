import { ThailandFlag } from '@energyweb/origin-ui-assets';
import { EnergyTypeEnum, PowerFormatter } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import {
  TUseSpecsForMyDeviceCard,
  TUseSpecsForMyDeviceCardReturnType,
} from './types';
import { useMainFuelType, getEnergyTypeImage } from '../utils';

export const useSpecsForMyDeviceCard: TUseSpecsForMyDeviceCard = ({
  device,
  allTypes,
}) => {
  const { t } = useTranslation();

  const { mainType, restType } = useMainFuelType(device.fuelType, allTypes);
  const deviceIconRegular = getEnergyTypeImage(
    mainType.toLowerCase() as EnergyTypeEnum
  );

  const cardHeaderProps: TUseSpecsForMyDeviceCardReturnType['cardHeaderProps'] =
    {
      deviceName: device.name,
      buttonText: t('device.card.viewDetailsButton'),
      buttonLink: `/device/detail-view/${device.id}`,
      specFieldProps: {
        label: t('device.card.capacity'),
        value: PowerFormatter.format(device.capacity),
      },
    };

  const cardContentProps: TUseSpecsForMyDeviceCardReturnType['cardContentProps'] =
    {
      iconsProps: [
        {
          icon: deviceIconRegular,
          title: mainType,
          subtitle: restType,
        },
        {
          icon: ThailandFlag,
          title: `${device.region}, ${device.subregion}`,
        },
      ],
    };

  return {
    // This is impossible to get properly due to way we handle files
    imageUrl: '',
    fallbackIcon: deviceIconRegular,
    cardHeaderProps,
    cardContentProps,
  };
};
