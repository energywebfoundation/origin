import { IconTextProps, SpecFieldProps } from '@energyweb/origin-ui-core';
import { EnergyTypeEnum } from '@energyweb/origin-ui-utils';
import {
  getDeviceDetailedType,
  getDeviceMainType,
  getEnergyTypeImage,
} from '../utils';

export const prepareDeviceDetailViewSpecs = ({ t, device }) => {
  const deviceMainType = getDeviceMainType(device);
  const headingIcon: IconTextProps = {
    icon: getEnergyTypeImage(deviceMainType.toLowerCase() as EnergyTypeEnum),
    title: deviceMainType,
    subtitle: getDeviceDetailedType(device),
  };

  const specsData: SpecFieldProps[] = [
    {
      label: t('device.card.certifiedMw'),
      value: 50,
    },
    {
      label: t('device.card.nameplateCapacity'),
      value: 4.3,
    },
    {
      label: t('device.card.certifiedByRegistry'),
      value: 'I-REC',
    },
    {
      label: t('device.card.toBeCertified'),
      value: 29.823,
    },
    {
      label: t('device.card.otherGreenAttr'),
      value: '-',
    },
    {
      label: t('device.card.publicSupport'),
      value: '-',
    },
    {
      label: t('device.card.vintageCOD'),
      value: 'Oct 5th, 2017',
    },
  ];

  return { headingIcon, specsData };
};
