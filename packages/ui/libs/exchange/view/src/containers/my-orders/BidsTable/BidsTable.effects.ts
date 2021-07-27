import { useCachedAllFuelTypes } from '@energyweb/origin-ui-exchange-data';
import { useMyOrdersBidsTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { BidsTableProps } from './BidsTable';

export const useBidsTableEffects = ({ bids, isLoading }: BidsTableProps) => {
  const allFuelTypes = useCachedAllFuelTypes();
  const tableData = useMyOrdersBidsTableLogic({
    bids,
    isLoading,
    allFuelTypes,
  });
  return tableData;
};
