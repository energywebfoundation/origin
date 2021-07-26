import { useCachedAllFuelTypes } from '@energyweb/origin-ui-exchange-data';
import {
  useAsksTableLogic,
  useBidsTableLogic,
} from '@energyweb/origin-ui-exchange-logic';
import { useTranslation } from 'react-i18next';
import { TradingViewProps } from './TradingView';

export const useTradingViewEffects = ({
  orderBookData,
  isLoading,
}: TradingViewProps) => {
  const { t } = useTranslation();
  const allFuelTypes = useCachedAllFuelTypes();

  const asksTableProps = useAsksTableLogic({
    asks: orderBookData.asks,
    isLoading,
    allFuelTypes,
  });
  const bidsTableProps = useBidsTableLogic({
    bids: orderBookData.bids,
    isLoading,
    allFuelTypes,
  });

  const asksTitle = t('exchange.viewMarket.asks');
  const popoverTextAsks = [
    t('exchange.viewMarket.popover.asksDescription'),
    t('exchange.viewMarket.popover.asksFurtherInstructions'),
  ];
  const bidsTitle = t('exchange.viewMarket.bids');
  const popoverTextBids = [
    t('exchange.viewMarket.popover.bidsDescription'),
    t('exchange.viewMarket.popover.bidsFurtherInstructions'),
  ];

  return {
    asksTableProps,
    bidsTableProps,
    asksTitle,
    popoverTextAsks,
    bidsTitle,
    popoverTextBids,
  };
};
