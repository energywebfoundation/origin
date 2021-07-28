import { OrderStatus } from '@energyweb/exchange-irec-react-query-client';
import { EnergyFormatter, formatDate } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { getMainFuelType } from '../utils';
import { TFormatBids, TUseBidsTableLogic } from './types';

const formatBidsForMyOrders: TFormatBids = ({
  bids,
  actions,
  allFuelTypes,
}) => {
  return bids?.map((bid) => {
    let fuelType = '-';
    if (!!bid?.product?.deviceType) {
      const fuelCode = bid.product.deviceType[0].split(';')[0];
      const { mainType } = getMainFuelType(fuelCode, allFuelTypes);
      fuelType = mainType;
    }

    const startVol = parseInt(EnergyFormatter.format(bid.startVolume));
    const currentVol = parseInt(EnergyFormatter.format(bid.currentVolume));
    const percentageFilled = (currentVol * 100) / startVol;
    const filled =
      bid.status === OrderStatus.PartiallyFilled
        ? `${percentageFilled}%`
        : '0%';

    return {
      id: bid.id,
      volume: EnergyFormatter.format(bid.currentVolume, true),
      price: bid.price / 100,
      fuelType: fuelType,
      generationStart: bid?.product?.generationFrom
        ? formatDate(bid.product.generationFrom)
        : '-',
      generationEnd: bid?.product?.generationTo
        ? formatDate(bid.product.generationTo)
        : '-',
      filled,
      actions,
    };
  });
};

export const useMyOrdersBidsTableLogic: TUseBidsTableLogic = ({
  bids,
  allFuelTypes,
  isLoading,
  actions,
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
    data: formatBidsForMyOrders({ allFuelTypes, bids, actions }) ?? [],
  };
};
