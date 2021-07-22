import {
  EnergyTypeEnum,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { TUseDeviceDetailViewLogic } from './types';
import { getEnergyTypeImage, useMainFuelType } from '../utils';

export const useDeviceDetailViewLogic: TUseDeviceDetailViewLogic = ({
  device,
  owner,
  allTypes,
  certifiedAmount,
}) => {
  const { t } = useTranslation();

  const locationProps = {
    // @should be changed to actual owner name
    owner: `Device owner organization id ${owner}`,
    location: `${device.region}, ${device.subregion}`,
    coordinates: `${device.latitude}, ${device.longitude}`,
  };

  const { mainType, restType } = useMainFuelType(device.fuelType, allTypes);
  const deviceIcon = getEnergyTypeImage(
    mainType.toLowerCase() as EnergyTypeEnum
  );

  const cardProps = {
    headingIconProps: {
      icon: deviceIcon,
      title: mainType,
      subtitle: restType,
    },
    specFields: [
      {
        label: t('device.card.certifiedMw'),
        value: PowerFormatter.format(parseInt(certifiedAmount)),
      },
      {
        label: t('device.card.nameplateCapacity'),
        value: PowerFormatter.format(device.capacity),
      },
      {
        label: t('device.card.certifiedByRegistry'),
        value: 'I-REC',
      },
      {
        label: t('device.card.toBeCertified'),
        value: '-',
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
        value: formatDate(dayjs(device.registrationDate).unix() * 1000),
      },
    ],
  };

  return {
    locationProps,
    cardProps,
  };
};
