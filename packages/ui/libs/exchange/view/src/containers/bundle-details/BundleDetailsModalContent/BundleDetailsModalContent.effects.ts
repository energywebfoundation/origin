import {
  Bundle,
  BundlePublicDTO,
} from '@energyweb/exchange-react-query-client';
import { BundleSplit } from '@energyweb/origin-ui-exchange-data';
import { EnergyFormatter } from '@energyweb/origin-ui-utils';
import { Unit } from '@energyweb/utils-general';
import { BigNumber } from 'ethers';
import { useState } from 'react';

export const bundlePrice = ({
  volume,
  price,
}: {
  volume: BigNumber;
  price: number;
}) => (price * volume.toNumber()) / (Unit[EnergyFormatter.displayUnit] * 100);

export const useBundleDetailsModalContentEffects = (
  splits: BundleSplit[],
  price: Bundle['price'] | BundlePublicDTO['price']
) => {
  const prices = splits
    ? splits.map(({ volume }) => bundlePrice({ volume, price: Number(price) }))
    : [];
  const maxPrice = Math.ceil(Math.max(...prices) / 10) * 10;
  const minPrice = Math.floor(Math.min(...prices) / 10) * 10;

  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);

  const filteredSplits = splits
    ? splits.filter(
        ({ volume }) =>
          bundlePrice({ volume, price: Number(price) }) >= priceRange[0] &&
          bundlePrice({ volume, price: Number(price) }) <= priceRange[1]
      )
    : [];

  return { filteredSplits, setPriceRange, priceRange, minPrice, maxPrice };
};
