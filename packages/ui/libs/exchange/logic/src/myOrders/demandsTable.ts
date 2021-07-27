import { EnergyFormatter, formatDate } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { getMainFuelType } from '../utils';
import { TFormatDemands, TUseDemandsTableLogic } from './types';

export const formatDemands: TFormatDemands = ({ demands, allFuelTypes }) => {
  return demands?.map((demand) => {
    const fuelCode = demand.product.deviceType[0].split(';')[0];
    const { mainType } = getMainFuelType(fuelCode, allFuelTypes);

    return {
      id: demand.id,
      volume: EnergyFormatter.format(demand.volumePerPeriod, true),
      price: demand.price / 100,
      fuelType: mainType,
      period: demand.periodTimeFrame,
      generationStart: formatDate(demand.start),
      generationEnd: formatDate(demand.end),
      status: demand.status,
    };
  });
};

export const useDemandsTableLogic: TUseDemandsTableLogic = ({
  demands,
  allFuelTypes,
  isLoading,
}) => {
  const { t } = useTranslation();
  return {
    tableTitle: t('exchange.myOrders.demands'),
    header: {
      volume: t('exchange.myOrders.volume'),
      price: t('exchange.myOrders.price'),
      fuelType: t('exchange.myOrders.type'),
      period: t('exchange.myOrders.period'),
      generationStart: t('exchange.myOrders.startDate'),
      generationEnd: t('exchange.myOrders.endDate'),
      status: t('exchange.myOrders.status'),
    },
    loading: isLoading,
    data: formatDemands({ allFuelTypes, demands }) ?? [],
  };
};
