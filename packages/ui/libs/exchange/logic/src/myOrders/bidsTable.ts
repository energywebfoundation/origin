import { EnergyFormatter, formatDate } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { getMainFuelType } from '../utils';
import { TFormatBids, TUseBidsTableLogic } from './types';

export const formatBids: TFormatBids = ({ bids, allFuelTypes }) => {
  return bids?.map((bid) => {
    const fuelCode = bid.product.deviceType[0].split(';')[0];
    const { mainType } = getMainFuelType(fuelCode, allFuelTypes);

    return {
      id: bid.id,
      volume: EnergyFormatter.format(bid.currentVolume, true),
      price: bid.price / 100,
      fuelType: mainType || '-',
      generationStart: formatDate(bid.product.generationFrom) || '-',
      generationEnd: formatDate(bid.product.generationTo) || '-',
      filled: (bid as any)?.filled || '-',
    };
  });
};

export const useMyOrdersBidsTableLogic: TUseBidsTableLogic = ({
  bids,
  allFuelTypes,
  isLoading,
}) => {
  const { t } = useTranslation();
  return {
    tableTitle: t('exchange.myOrders.bids'),
    header: {
      volume: t('exchange.myOrders.volume'),
      price: t('exchange.myOrders.price'),
      fuelType: t('exchange.myOrders.type'),
      generationStart: t('exchange.myOrders.generationStart'),
      generationEnd: t('exchange.myOrders.generationEnd'),
      filled: t('exchange.myOrders.filled'),
      actions: '',
    },
    loading: isLoading,
    data: formatBids({ allFuelTypes, bids }) ?? [],
  };
};
