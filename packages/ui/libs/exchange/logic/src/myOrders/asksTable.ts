import { OrderStatus } from '@energyweb/exchange-irec-react-query-client';
import { EnergyFormatter, formatDate } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { TFormatAsks, TUseAsksTableLogic } from './types';

const formatAsksForMyOrders: TFormatAsks = ({ asks, allDevices, actions }) => {
  return asks?.map((ask) => {
    // asset is not included in OrderDTO
    const deviceName = allDevices.find(
      (device) => device.externalRegistryId === (ask as any).asset.deviceId
    )?.name;
    const startVol = parseInt(EnergyFormatter.format(ask.startVolume));
    const currentVol = parseInt(EnergyFormatter.format(ask.currentVolume));
    const percentageFilled = (currentVol * 100) / startVol;
    const filled =
      ask.status === OrderStatus.PartiallyFilled
        ? `${percentageFilled}%`
        : '0%';

    return {
      id: ask.id,
      volume: EnergyFormatter.format(ask.currentVolume),
      price: ask.price / 100,
      facilityName: deviceName || '-',
      generationStart: formatDate(ask.product.generationFrom) || '-',
      generationEnd: formatDate(ask.product.generationTo) || '-',
      filled,
      actions,
    };
  });
};

export const useMyOrdersAsksTableLogic: TUseAsksTableLogic = ({
  asks,
  allDevices,
  isLoading,
  actions,
  tableFilters,
  openDetailsModal,
}) => {
  const { t } = useTranslation();
  return {
    tableTitle: t('exchange.myOrders.asks'),
    tableTitleProps: { gutterBottom: false, variant: 'h5' },
    header: {
      volume: t('exchange.myOrders.volume'),
      price: t('exchange.myOrders.price'),
      facilityName: t('exchange.myOrders.facilityName'),
      generationStart: t('exchange.myOrders.generationStart'),
      generationEnd: t('exchange.myOrders.generationEnd'),
      filled: t('exchange.myOrders.filled'),
      actions: '',
    },
    loading: isLoading,
    tableFilters,
    data: formatAsksForMyOrders({ allDevices, asks, actions }) ?? [],
    onRowClick: openDetailsModal,
  };
};
