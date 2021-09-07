import { useTranslation } from 'react-i18next';
import { EnergyFormatter, formatDate } from '@energyweb/origin-ui-utils';
import { TUseLogicMyTrades, TFormatMyTradesData } from './types';

const formatMyTradesData: TFormatMyTradesData = ({ t, trades }) => {
  const buyText = t('exchange.myTrades.buy');
  const sellText = t('exchange.myTrades.sell');

  return (
    trades?.map((trade) => {
      const price = trade.price / 100;
      const totalPrice =
        parseFloat(EnergyFormatter.format(trade.volume)) * price;

      return {
        id: trade.id,
        date: formatDate(trade.created),
        side: trade.bidId ? buyText : sellText,
        volume: EnergyFormatter.format(trade.volume),
        price,
        total: `$${totalPrice.toFixed(2)}`,
      };
    }) || []
  );
};

export const useLogicMyTrades: TUseLogicMyTrades = ({ trades, loading }) => {
  const { t } = useTranslation();
  return {
    tableTitle: t('exchange.myTrades.tableTitle'),
    tableTitleProps: { variant: 'h5' },
    header: {
      date: t('exchange.myTrades.date'),
      side: t('exchange.myTrades.side'),
      volume: `${t('exchange.myTrades.volume')} (${
        EnergyFormatter.displayUnit
      })`,
      price: t('exchange.myTrades.price'),
      total: t('exchange.myTrades.total'),
    },
    pageSize: 10,
    loading: loading,
    data: formatMyTradesData({
      t,
      trades,
    }),
  };
};
