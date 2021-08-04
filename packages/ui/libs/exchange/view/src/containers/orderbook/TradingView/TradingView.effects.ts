import {
  useCachedAllFuelTypes,
  useCachedUser,
} from '@energyweb/origin-ui-exchange-data';
import {
  useAsksTableLogic,
  useBidsTableLogic,
} from '@energyweb/origin-ui-exchange-logic';
import { useMediaQuery, useTheme } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { TradingViewProps } from './TradingView';
import { useStyles } from './TradingView.styles';

export const useTradingViewEffects = ({
  orderBookData,
  isLoading,
}: TradingViewProps) => {
  const { t } = useTranslation();
  const allFuelTypes = useCachedAllFuelTypes();
  const user = useCachedUser();
  const classes = useStyles();

  const asksTableProps = useAsksTableLogic({
    asks: orderBookData.asks,
    isLoading,
    allFuelTypes,
    user,
    className: classes.owned,
  });
  const bidsTableProps = useBidsTableLogic({
    bids: orderBookData.bids,
    isLoading,
    allFuelTypes,
    user,
    className: classes.owned,
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

  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('md'));

  return {
    asksTableProps,
    bidsTableProps,
    asksTitle,
    popoverTextAsks,
    bidsTitle,
    popoverTextBids,
    mobileView,
  };
};
