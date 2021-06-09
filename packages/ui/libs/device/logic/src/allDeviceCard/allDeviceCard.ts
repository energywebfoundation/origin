import { ThailandFlag } from '@energyweb/origin-ui-assets';
import {
  CardWithImageProps,
  IconTextProps,
  SpecFieldProps,
} from '@energyweb/origin-ui-core';
import { EnergyTypeEnum, PowerFormatter } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { TUseSpecsForAllDeviceCard } from './types';
import { useMainFuelType, getEnergyTypeImage } from '../utils';
import { getDeviceAgeInYears } from '../utils';

export const useSpecsForAllDeviceCard: TUseSpecsForAllDeviceCard = ({
  device,
  allTypes,
  clickHandler,
}) => {
  const { t } = useTranslation();

  const specsData: SpecFieldProps[] = [
    {
      label: t('device.card.capacity'),
      value: PowerFormatter.format(device.capacity),
    },
    {
      label: t('device.card.age'),
      value: getDeviceAgeInYears(device.commissioningDate),
    },
  ];
  const { mainType, restType } = useMainFuelType(device.fuelType, allTypes);

  const deviceIcon = getEnergyTypeImage(
    mainType.toLowerCase() as EnergyTypeEnum
  );
  const iconsData: IconTextProps[] = [
    {
      icon: deviceIcon,
      title: mainType,
      subtitle: restType,
    },
    {
      icon: ThailandFlag,
      title: `${device.region}, ${device.subregion}`,
    },
  ];

  const detailViewLink = `/device/detail-view/${device.id}`;

  const cardProps: Omit<CardWithImageProps, 'content'> = {
    heading: device.name,
    hoverText: t('device.card.hoverText').toUpperCase(),
    imageUrl: '',
    fallbackIcon: deviceIcon,
    onActionClick: () => clickHandler(detailViewLink),
  };

  return { specsData, iconsData, cardProps };
};
