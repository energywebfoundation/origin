import {
  useApiBidsAndAsks,
  useApiPermissions,
} from '@energyweb/origin-ui-exchange-data';

export const useMyOrdersPageEffects = () => {
  const { permissions } = useApiPermissions();
  const { bids, asks, isLoading } = useApiBidsAndAsks();

  return { bids, asks, isLoading, permissions };
};
