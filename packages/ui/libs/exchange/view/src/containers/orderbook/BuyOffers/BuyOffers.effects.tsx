import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import {
  useCachedAllFuelTypes,
  useCachedUser,
} from '@energyweb/origin-ui-exchange-data';
import { useBuyOffersTableLogic } from '@energyweb/origin-ui-exchange-logic';
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

  return tableProps;
};
