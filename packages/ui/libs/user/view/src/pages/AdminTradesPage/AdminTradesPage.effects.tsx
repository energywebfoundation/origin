import { useApiAllTrades } from '@energyweb/origin-ui-user-data';
import { useTradesTableLogic } from '@energyweb/origin-ui-user-logic';

export const useAdminTradesPageEffects = () => {
  const { trades, isLoading: loading } = useApiAllTrades();

  const tableProps = useTradesTableLogic({
    trades,
    loading,
  });

  return tableProps;
};
