import { EnergyFormatter, formatDate } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { getMainFuelType } from '../utils';
import { TFormatDemands, TUseDemandsTableLogic } from './types';

export const formatDemands: TFormatDemands = ({
  demands,
  allFuelTypes,
  actions,
}) => {
  return demands?.map((demand) => {
    const fuelCodes =
      demand.product.deviceType &&
      demand.product.deviceType.map((type) => type.split(';')[0]);
    const fuelTypes =
      fuelCodes && fuelCodes.length > 0
        ? fuelCodes
            .map((code) => {
              const { mainType } = getMainFuelType(code, allFuelTypes);
              return mainType;
            })
            .join(', ')
        : '-';

    return {
      id: demand.id,
      volume: EnergyFormatter.format(demand.volumePerPeriod, true),
      price: demand.price / 100,
      fuelType: fuelTypes,
      period: demand.periodTimeFrame,
      generationStart: formatDate(demand.start),
      generationEnd: formatDate(demand.end),
      status: demand.status,
      actions,
    };
  });
};

export const useDemandsTableLogic: TUseDemandsTableLogic = ({
  demands,
  allFuelTypes,
  isLoading,
  actions,
  tableFilters,
  openUpdateModal,
}) => {
  const { t } = useTranslation();
  return {
    tableTitle: t('exchange.myOrders.demands'),
    tableTitleProps: { gutterBottom: false, variant: 'h5' },
    header: {
      volume: t('exchange.myOrders.volume'),
      price: t('exchange.myOrders.price'),
      fuelType: t('exchange.myOrders.type'),
      period: t('exchange.myOrders.period'),
      generationStart: t('exchange.myOrders.startDate'),
      generationEnd: t('exchange.myOrders.endDate'),
      status: t('exchange.myOrders.status'),
      actions: '',
    },
    loading: isLoading,
    onRowClick: openUpdateModal,
    tableFilters,
    data: formatDemands({ allFuelTypes, demands, actions }) ?? [],
  };
};
