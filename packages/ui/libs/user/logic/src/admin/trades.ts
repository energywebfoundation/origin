import { TradeDTO } from '@energyweb/exchange-irec-react-query-client';
import { TableComponentProps, TableRowData } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@energyweb/origin-ui-utils';
import { ComposedPublicDevice } from '@energyweb/origin-ui-user-data';

type TUseAdminTradesTableLogicArgs = {
  trades: TradeDTO[];
  allDevices: ComposedPublicDevice[];
  isLoading: boolean;
};
type TUseAdminTradesTableLogic = (
  args: TUseAdminTradesTableLogicArgs
) => TableComponentProps<string>;
type TFormatTrades = (
  args: Omit<TUseAdminTradesTableLogicArgs, 'isLoading'>
) => TableRowData<string>[];

type FormattedTrade = {
  id: string;
  date: string;
  buyer: string;
  seller: string;
  deviceName: string;
  volume: number;
  price: number;
  total: number;
};

const formatTrades: TFormatTrades = ({ trades, allDevices }) => {
  const formattedTrades: FormattedTrade[] = [];

  trades?.forEach((trade) => {
    formattedTrades.push({
      id: `${trade.id}`,
      date: formatDate(trade.created),
      buyer: '',
      seller: '',
      deviceName: '',
      volume: 0,
      price: 0,
      total: 0,
    });
  });

  // trades?.forEach((trade) =>
  //   trade.claims?.forEach((claim) => {
  //     formattedClaims.push({
  //       id: `${trade.id};${claim.claimData.periodStartDate}`,
  //       certificateId: trade.id,
  //       deviceName: allDevices.find(
  //         (device) => device.externalRegistryId === trade.deviceId
  //       )?.name,
  //       energy: PowerFormatter.format(parseInt(claim.value), true),
  //       beneficiary: claim.claimData.beneficiary,
  //       fromDate: formatDate(claim.claimData.periodStartDate),
  //       toDate: formatDate(claim.claimData.periodEndDate),
  //     });
  //   })
  // );

  return formattedTrades;
};

export const useAdminTradesTableLogic: TUseAdminTradesTableLogic = ({
  isLoading,
  trades,
  allDevices,
}) => {
  const { t } = useTranslation();
  return {
    header: {
      date: t('admin.trades.date'),
      buyer: t('admin.trades.buyer'),
      seller: t('admin.trades.seller'),
      energy: 'Energy',
      deviceName: t('admin.trades.device'),
      volume: t('admin.trades.quantity'),
      price: t('admin.trades.price'),
      total: t('admin.trades.total'),
    },
    pageSize: 10,
    loading: isLoading,
    data: formatTrades({ trades, allDevices }),
  };
};
