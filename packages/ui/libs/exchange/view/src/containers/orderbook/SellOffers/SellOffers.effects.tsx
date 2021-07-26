import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import {
  useCachedAllFuelTypes,
  useCachedUser,
} from '@energyweb/origin-ui-exchange-data';
import { useSellOffersTableLogic } from '@energyweb/origin-ui-exchange-logic';

export const useSellOffersEffects = (
  asks: OrderBookOrderDTO[],
  isLoading: boolean
) => {
  const allFuelTypes = useCachedAllFuelTypes();
  const user = useCachedUser();
  const tableProps = useSellOffersTableLogic({
    asks,
    isLoading,
    allFuelTypes,
    user,
  });

  return tableProps;
};
