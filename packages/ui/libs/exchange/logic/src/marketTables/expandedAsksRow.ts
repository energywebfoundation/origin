import { formatDate } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { getMainFuelType } from '../utils';
import { TUseExpandedAsksRowLogic } from './types';

export const useExpandedAsksRowLogic: TUseExpandedAsksRowLogic = ({
  ask,
  device,
  allFuelTypes,
  allDeviceTypes,
}) => {
  const { t } = useTranslation();
  const splitDeviceType = ask.product.deviceType[0].split(';');

  const fuelTypeCode = splitDeviceType[0];
  const fuelType = getMainFuelType(fuelTypeCode, allFuelTypes);

  const deviceTypeCode = splitDeviceType[1];
  const deviceType = allDeviceTypes.find(
    (type) => type.code === deviceTypeCode
  )?.name;

  return {
    facilityName: {
      title: t('exchange.viewMarket.facilityName'),
      text: device.name,
    },
    constructed: {
      title: t('exchange.viewMarket.constructed'),
      text: formatDate(device.commissioningDate),
    },
    fuelDeviceType: {
      title: t('exchange.viewMarket.fuelDeviceType'),
      text: `${fuelType.mainType} ${fuelType.restType} / ${deviceType}`,
    },
    generationFrom: {
      title: t('exchange.viewMarket.generationFrom'),
      text: formatDate(ask.product.generationFrom),
    },
    generationTo: {
      title: t('exchange.viewMarket.generationTo'),
      text: formatDate(ask.product.generationTo),
    },
  };
};
