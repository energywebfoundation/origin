import { useApiBidsAndAsks } from '@energyweb/origin-ui-exchange-data';
import { usePermissions } from '@energyweb/origin-ui-utils';

export const useMyOrdersPageEffects = () => {
  const { canAccessPage } = usePermissions();
  const { bids, asks, isLoading } = useApiBidsAndAsks();

  return { bids, asks, isLoading, canAccessPage };
};
