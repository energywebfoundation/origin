import { formatCurrencyComplete } from '@energyweb/origin-ui-utils';
import { Box, Slider, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { SliderLabel } from '../SliderLabel';
import { useBundleSliderEffects } from './BundleSlider.effects';

export interface BundleSliderProps {
  minPrice: number;
  maxPrice: number;
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
}

export const BundleSlider: FC<BundleSliderProps> = ({
  minPrice,
  maxPrice,
  priceRange,
  setPriceRange,
}) => {
  const { priceStep, marks } = useBundleSliderEffects(minPrice, maxPrice);

  return (
    <Box mt={2} mb={5} px={3}>
      <Typography align="center" gutterBottom>
        Select price range to view more combinations
      </Typography>
      <Slider
        defaultValue={[minPrice, maxPrice]}
        value={priceRange}
        onChange={(event: any, value: number | number[]) =>
          setPriceRange(value as number[])
        }
        marks={marks}
        min={minPrice}
        max={maxPrice}
        step={priceStep}
        valueLabelDisplay="on"
        valueLabelFormat={(label: number) => formatCurrencyComplete(label)}
        components={{ ValueLabel: SliderLabel }}
      />
    </Box>
  );
};
