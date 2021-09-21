import {
  AssetDTO,
  OrderBookOrderDTO,
  useAssetControllerGet,
} from '@energyweb/exchange-irec-react-query-client';

export const useApiGetAssetById = (assetId: OrderBookOrderDTO['assetId']) => {
  const { data, isLoading } = useAssetControllerGet(assetId);
  const asset = data || ({} as AssetDTO);
  return { asset, isLoading };
};
