import { Divider } from '@material-ui/core';
import React, { Dispatch, FC } from 'react';
import { FormInput, MaterialDatepicker } from '@energyweb/origin-ui-core';
import { isEmpty } from 'lodash';
import { TotalAndButtons } from '../TotalAndButtons';
import { useStyles } from './OneTimePurchase.styles';
import { useOneTimePurchaseEffects } from './OneTimePurchase.effects';
import { MarketFiltersActions, MarketFiltersState } from '../../../reducer';

interface OneTimePurchaseProps {
  filters: MarketFiltersState;
  dispatch: Dispatch<MarketFiltersActions>;
}

export const OneTimePurchase: FC<OneTimePurchaseProps> = ({
  filters,
  dispatch,
}) => {
  const classes = useStyles();
  const {
    register,
    fields,
    buttons,
    errors,
    dirtyFields,
    totalPrice,
    handleGenerationToChange,
    handleGenerationFromChange,
  } = useOneTimePurchaseEffects(filters, dispatch);
  const { generationFrom, generationTo, energy, price } = fields;
  return (
    <div className={classes.wraper}>
      <div className={classes.block}>
        <div className={classes.item}>
          <MaterialDatepicker
            field={generationFrom}
            value={filters.generationFrom}
            onChange={handleGenerationFromChange}
          />
        </div>
        <div className={classes.item}>
          <MaterialDatepicker
            field={generationTo}
            value={filters.generationTo}
            onChange={handleGenerationToChange}
          />
        </div>
      </div>
      <Divider className={classes.divider} />
      <div className={classes.block}>
        <div className={classes.item}>
          <FormInput
            variant="filled"
            margin="none"
            field={energy}
            isDirty={dirtyFields[energy.name]}
            register={register}
            errorExists={!isEmpty(errors[energy.name])}
            errorText={errors[energy.name]?.message ?? ''}
          />
        </div>
        <div className={classes.item}>
          <FormInput
            variant="filled"
            margin="none"
            field={price}
            isDirty={dirtyFields[price.name]}
            register={register}
            errorExists={!isEmpty(errors[price.name])}
            errorText={errors[price.name]?.message ?? ''}
          />
        </div>
      </div>
      <TotalAndButtons totalPrice={totalPrice} buttons={buttons} />
    </div>
  );
};
