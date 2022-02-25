import { TableComponentProps, TableRowData } from '@energyweb/origin-ui-core';
import { TradeForAdminDTO } from '@energyweb/exchange-irec-react-query-client';
import { useTranslation } from 'react-i18next';
import { formatDate, EnergyFormatter } from '@energyweb/origin-ui-utils';

type TUseTradesTableLogicArgs = {
  trades: TradeForAdminDTO[];
  loading: boolean;
};

type TUseTradesTableLogic = (
  args: TUseTradesTableLogicArgs
) => TableComponentProps<string>;

type TFormatTrades = (
  args: Omit<TUseTradesTableLogicArgs, 'loading'>
) => TableRowData<string>[];

type FormattedTrades = {
  id: string;
  dateAndTime: string;
  buyerId: string;
  sellerId: string;
  volume: string;
  certificateId: string;
  price: number;
  total: string;
};

const formatTrades: TFormatTrades = ({ trades }): FormattedTrades[] => {
  return (
    trades?.map((trade) => {
      const price = trade.price / 100;
      const totalPrice =
        parseFloat(EnergyFormatter.format(trade.volume)) * price;

      return {
        id: trade.id,
        dateAndTime: formatDate(trade.created, true),
        buyerId: trade.bidUserId,
        sellerId: trade.askUserId,
        volume: EnergyFormatter.format(trade.volume),
        certificateId: trade.tokenId,
        price,
        total: `$${totalPrice.toFixed(2)}`,
      };
    }) || ([] as FormattedTrades[])
  );
};

export const useTradesTableLogic: TUseTradesTableLogic = ({
  trades,
  loading,
}) => {
  const { t } = useTranslation();
  return {
    header: {
      dateAndTime: t('admin.trades.dateAndTime'),
      buyerId: t('admin.trades.buyerId'),
      sellerId: t('admin.trades.sellerId'),
      certificateId: t('admin.trades.certificateId'),
      volume: `${t('admin.trades.volume')} (${EnergyFormatter.displayUnit})`,
      price: t('admin.trades.price'),
      total: t('admin.trades.total'),
    },
    pageSize: 10,
    loading,
    data: formatTrades({
      trades,
    }),
  };
};
