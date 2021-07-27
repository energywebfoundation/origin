import { EnergyFormatter, formatDate } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { TFormatAsks, TUseAsksTableLogic } from './types';

export const formatAsks: TFormatAsks = ({ asks, myDevices }) => {
  return asks?.map((ask) => {
    // asset is not included in OrderDTO
    const deviceName = myDevices.find(
      (device) => device.externalRegistryId === (ask as any).asset.deviceId
    )?.name;

    return {
      id: ask.id,
      volume: EnergyFormatter.format(ask.currentVolume),
      price: ask.price / 100,
      facilityName: deviceName || '-',
      generationStart: formatDate(ask.product.generationFrom) || '-',
      generationEnd: formatDate(ask.product.generationTo) || '-',
      filled: (ask as any)?.filled || '-',
    };
  });
};

export const useMyOrdersAsksTableLogic: TUseAsksTableLogic = ({
  asks,
  myDevices,
  isLoading,
}) => {
  const { t } = useTranslation();
  return {
    tableTitle: t('exchange.myOrders.asks'),
    header: {
      volume: t('exchange.myOrders.volume'),
      price: t('exchange.myOrders.price'),
      facilityName: t('exchange.myOrders.facilityName'),
      generationStart: t('exchange.myOrders.generationStart'),
      generationEnd: t('exchange.myOrders.generationEnd'),
      filled: t('exchange.myOrders.filled'),
    },
    loading: isLoading,
    data: formatAsks({ myDevices, asks }) ?? [],
  };
};
