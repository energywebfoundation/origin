import { SelectAutocomplete } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@material-ui/core';
import React, { Dispatch, FC } from 'react';
import { MarketFiltersActions, MarketFiltersState } from '../../../reducer';
import { useMarketFiltersEffects } from './MarketFilters.effects';
import { useStyles } from './MarketFilters.styles';

export interface MarketFiltersProps {
  state: MarketFiltersState;
  dispatch: Dispatch<MarketFiltersActions>;
}

export const MarketFilters: FC<MarketFiltersProps> = (props) => {
  const {
    fuelTypeAutocompleteProps,
    deviceTypeAutocompleteProps,
    gridOperatorAutocompleteProps,
    regionsAutocompleteProps,
    subRegionsAutocompleteProps,
    isLoading,
  } = useMarketFiltersEffects(props);
  const classes = useStyles();

  if (isLoading) return <CircularProgress />;

  return (
    <div>
      <div>
        <SelectAutocomplete
          className={classes.singleItem}
          {...fuelTypeAutocompleteProps}
        />
      </div>
      <div>
        <SelectAutocomplete
          className={classes.singleItem}
          {...deviceTypeAutocompleteProps}
        />
      </div>
      <div className={classes.blockWrapper}>
        <SelectAutocomplete
          className={classes.item}
          {...regionsAutocompleteProps}
        />
        <SelectAutocomplete
          className={classes.item}
          {...gridOperatorAutocompleteProps}
        />
      </div>
      <div>
        <SelectAutocomplete
          className={classes.singleItem}
          {...subRegionsAutocompleteProps}
        />
      </div>
    </div>
  );
};
