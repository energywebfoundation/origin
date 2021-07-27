import { useApiMyDevices } from '@energyweb/origin-ui-exchange-data';
import { useMyOrdersAsksTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { AsksTableProps } from './AsksTable';

export const useAsksTableEffects = ({ asks, isLoading }: AsksTableProps) => {
  const { myDevices, isLoading: areDevicesLoading } = useApiMyDevices();
  const tableData = useMyOrdersAsksTableLogic({
    asks,
    myDevices,
    isLoading: isLoading || areDevicesLoading,
  });
  return tableData;
};
