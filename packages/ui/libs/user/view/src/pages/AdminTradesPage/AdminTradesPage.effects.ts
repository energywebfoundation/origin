import { useFetchAllDevices } from '@energyweb/origin-ui-user-data';
import { useApiAdminTrades } from '@energyweb/origin-ui-exchange-data';
import { useAdminTradesTableLogic } from '@energyweb/origin-ui-user-logic';

export const useAdminTradesPageEffects = () => {
  const { adminTrades, isLoading: areTradesLoading } = useApiAdminTrades();
  const { allDevices, isLoading: areDeviceLoading } = useFetchAllDevices();

  const isLoading = areDeviceLoading || areTradesLoading;

  const tableProps = useAdminTradesTableLogic({
    trades: adminTrades,
    allDevices,
    isLoading,
  });

  return tableProps;
};
