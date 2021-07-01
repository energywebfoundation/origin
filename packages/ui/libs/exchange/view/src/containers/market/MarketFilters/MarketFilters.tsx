import { SelectAutocomplete } from '@energyweb/origin-ui-core';
import { CircularProgress, TextField } from '@material-ui/core';
import React, { Dispatch, FC } from 'react';
import {
  MarketFiltersActions,
  MarketFiltersState,
} from '../../../pages/ViewMarketPage';
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
    isLoading,
  } = useMarketFiltersEffects(props);
  const classes = useStyles();

  if (isLoading) return <CircularProgress />;

  return (
    <div>
      <div className={classes.blockWrapper}>
        <SelectAutocomplete
          className={classes.item}
          {...fuelTypeAutocompleteProps}
        />
        <SelectAutocomplete
          className={classes.item}
          {...deviceTypeAutocompleteProps}
        />
      </div>
      <div className={classes.blockWrapper}>
        <TextField label="Region" variant="filled" className={classes.item} />
        <TextField
          label="Subregion"
          variant="filled"
          className={classes.item}
        />
      </div>
      <div>
        <SelectAutocomplete
          className={classes.singleItem}
          {...gridOperatorAutocompleteProps}
        />
      </div>
    </div>
  );
};
