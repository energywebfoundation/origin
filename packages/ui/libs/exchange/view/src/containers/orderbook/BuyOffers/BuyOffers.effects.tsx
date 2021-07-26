import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { useCachedAllFuelTypes } from '@energyweb/origin-ui-exchange-data';
import { useBuyOffersTableLogic } from '@energyweb/origin-ui-exchange-logic';

export const useBuyOffersEffects = (
  bids: OrderBookOrderDTO[],
  isLoading: boolean
) => {
  const allFuelTypes = useCachedAllFuelTypes();
  const tableProps = useBuyOffersTableLogic({ bids, isLoading, allFuelTypes });

  return tableProps;
};
