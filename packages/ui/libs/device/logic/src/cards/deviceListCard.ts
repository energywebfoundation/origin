import { ThailandFlag } from '@energyweb/origin-ui-assets';
import { IconTextProps, SpecFieldProps } from '@energyweb/origin-ui-core';
import { EnergyTypeEnum, PowerFormatter } from '@energyweb/origin-ui-utils';
import { TPrepareDeviceSpecsForCard } from '../types';
import {
  getDeviceDetailedType,
  getDeviceMainType,
  getEnergyTypeImage,
} from '../utils';
import { getDeviceAgeInYears } from '../utils/getDeviceAge';

export const prepareDeviceSpecsForCard: TPrepareDeviceSpecsForCard = ({
  t,
  device,
}) => {
  const specsData: SpecFieldProps[] = [
    {
      label: t('device.card.capacity'),
      value: PowerFormatter.format(device.capacityInW),
    },
    {
      label: t('device.card.age'),
      value: getDeviceAgeInYears(device.operationalSince),
    },
  ];
  const deviceMainType = getDeviceMainType(device);
  const iconsData: IconTextProps[] = [
    {
      icon: getEnergyTypeImage(deviceMainType.toLowerCase() as EnergyTypeEnum),
      title: deviceMainType,
      subtitle: getDeviceDetailedType(device),
    },
    {
      icon: ThailandFlag,
      title: device.province + ', ' + device.region,
    },
  ];

  return { specsData, iconsData };
};
