import {
  Bundle,
  BundlePublicDTO,
} from '@energyweb/exchange-react-query-client';
import { BundleSplit } from '@energyweb/origin-ui-exchange-data';
import React, { FC } from 'react';
import { BundleContents } from '../BundleContents';
import { BundleSlider } from '../BundleSlider';
import { useBundleDetailsModalContentEffects } from './BundleDetailsModalContent.effects';

interface BundleDetailsModalContentProps {
  bundle: Bundle | BundlePublicDTO;
  splits: BundleSplit[];
  isOwner: boolean;
}

export const BundleDetailsModalContent: FC<BundleDetailsModalContentProps> = ({
  bundle,
  splits,
  isOwner,
}) => {
  const { filteredSplits, minPrice, maxPrice, priceRange, setPriceRange } =
    useBundleDetailsModalContentEffects(splits, bundle?.price);

  return (
    <>
      <BundleSlider
        minPrice={minPrice}
        maxPrice={maxPrice}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />
      <BundleContents
        bundle={bundle}
        splits={filteredSplits}
        isOwner={isOwner}
      />
    </>
  );
};
