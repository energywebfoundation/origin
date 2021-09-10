import {
  Bundle,
  BundlePublicDTO,
  BundleSplitItemDTO,
  useBundleControllerAvailableBundleSplits,
} from '@energyweb/exchange-react-query-client';
import { BigNumber } from 'ethers';

export type BundleSplit = {
  volume: BigNumber;
  items: Array<{
    id: BundleSplitItemDTO['id'];
    volume: BigNumber;
  }>;
};

export const useApiBundleSplits = (
  id: Bundle['id'] | BundlePublicDTO['id']
) => {
  const {
    data: bundleSplit,
    isLoading,
  } = useBundleControllerAvailableBundleSplits(id);

  const splits: BundleSplit[] = bundleSplit?.splits?.map((split) => ({
    volume: BigNumber.from(split.volume),
    items: split.items.map((item) => ({
      id: item.id,
      volume: BigNumber.from(item.volume),
    })),
  }));

  return { splits, isLoading };
};
