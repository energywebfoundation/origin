import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import {
  useCachedAllFuelTypes,
  useCachedUser,
} from '@energyweb/origin-ui-exchange-data';
import { useBuyOffersTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { useMediaQuery, useTheme } from '@material-ui/core';
import { useStyles } from './BuyOffers.styles';

export const useBuyOffersEffects = (
  bids: OrderBookOrderDTO[],
  isLoading: boolean
) => {
  const allFuelTypes = useCachedAllFuelTypes();
  const user = useCachedUser();
  const classes = useStyles();
  const tableProps = useBuyOffersTableLogic({
    bids,
    isLoading,
    allFuelTypes,
    user,
    className: classes.owned,
  });

  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('md'));

  return { tableProps, mobileView };
};
