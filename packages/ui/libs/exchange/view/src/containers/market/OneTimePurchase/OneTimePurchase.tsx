import { Divider } from '@material-ui/core';
import React, { FC } from 'react';
import { FormDatePicker, FormInput } from '@energyweb/origin-ui-core';
import { isEmpty } from 'lodash';
import { TotalAndButtons } from '../TotalAndButtons';
import { useStyles } from './OneTimePurchase.styles';
import { useOneTimePurchaseEffects } from './OneTimePurchase.effects';
import { MarketFiltersState } from '../../../pages';

interface OneTimePurchaseProps {
  filters: MarketFiltersState;
}

export const OneTimePurchase: FC<OneTimePurchaseProps> = ({ filters }) => {
  const classes = useStyles();
  const {
    register,
    control,
    fields,
    buttons,
    errors,
    dirtyFields,
    totalPrice,
  } = useOneTimePurchaseEffects(filters);
  const { generationFrom, generationTo, energy, price } = fields;
  return (
    <div>
      <div className={classes.block}>
        <div className={classes.item}>
          <FormDatePicker
            control={control}
            errorExists={!isEmpty(errors[generationFrom.name])}
            errorText={errors[generationFrom.name]?.message ?? ''}
            field={generationFrom}
          />
        </div>
        <div className={classes.item}>
          <FormDatePicker
            control={control}
            errorExists={!isEmpty(errors[generationTo.name])}
            errorText={errors[generationTo.name]?.message ?? ''}
            field={generationTo}
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
