import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import {
  useApiGetAssetById,
  useApiGetIRecDeviceById,
  useCachedAllDeviceTypes,
  useCachedAllFuelTypes,
} from '@energyweb/origin-ui-exchange-data';
import { useExpandedAsksRowLogic } from '@energyweb/origin-ui-exchange-logic';
import { useOrderBookAsksContext } from '../../../context';

export const useExpandedAsksRowEffects = (id: OrderBookOrderDTO['id']) => {
  const asks = useOrderBookAsksContext();
  const ask = asks.find((ask) => ask.id === id);
  const assetId = ask?.assetId;
  const allFuelTypes = useCachedAllFuelTypes();
  const allDeviceTypes = useCachedAllDeviceTypes();

  const { asset, isLoading: isAssetLoading } = useApiGetAssetById(assetId);
  const { device, isLoading: isDeviceLoading } = useApiGetIRecDeviceById(
    asset.deviceId,
    !isAssetLoading
  );

  const expandedViewFields = useExpandedAsksRowLogic({
    ask,
    device,
    allFuelTypes,
    allDeviceTypes,
  });

  const isLoading = isAssetLoading || isDeviceLoading;

  return { isLoading, ...expandedViewFields };
};
