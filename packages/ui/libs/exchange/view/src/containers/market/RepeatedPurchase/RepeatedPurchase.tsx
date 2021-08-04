import { Divider, InputAdornment, TextField } from '@material-ui/core';
import React, { FC } from 'react';
import {
  FormInput,
  FormSelect,
  FormDatePicker,
} from '@energyweb/origin-ui-core';
import { isEmpty } from 'lodash';
import { TotalAndButtons } from '../TotalAndButtons';
import { useStyles } from './RepeatedPurchase.styles';
import { useRepeatedPurchaseEffects } from './RepeatedPurchase.effects';
import { MarketFiltersState } from '../../../pages';

interface RepeatedPurchaseProps {
  filters: MarketFiltersState;
}

export const RepeatedPurchase: FC<RepeatedPurchaseProps> = ({ filters }) => {
  const classes = useStyles();
  const {
    register,
    control,
    fields,
    buttons,
    errors,
    dirtyFields,
    totalVolume,
    totalPrice,
    mobileView,
  } = useRepeatedPurchaseEffects(filters);
  const { period, volume, startDate, endDate, price } = fields;

  return (
    <div>
      <div className={classes.block}>
        <div className={classes.item}>
          <FormSelect
            control={control}
            errorExists={!isEmpty(errors[period.name])}
            errorText={errors[period.name]?.message ?? ''}
            field={period}
          />
        </div>
        <div className={classes.item}>
          <FormInput
            variant="filled"
            margin={mobileView ? 'none' : 'normal'}
            field={volume}
            isDirty={dirtyFields[volume.name]}
            register={register}
            errorExists={!isEmpty(errors[volume.name])}
            errorText={errors[volume.name]?.message ?? ''}
          />
        </div>
      </div>
      <div className={classes.block}>
        <div className={classes.item}>
          <FormDatePicker
            control={control}
            errorExists={!isEmpty(errors[startDate.name])}
            errorText={errors[startDate.name]?.message ?? ''}
            field={startDate}
          />
        </div>
        <div className={classes.item}>
          <FormDatePicker
            control={control}
            errorExists={!isEmpty(errors[endDate.name])}
            errorText={errors[endDate.name]?.message ?? ''}
            field={endDate}
          />
        </div>
      </div>
      <Divider className={classes.divider} />
      <div className={classes.block}>
        <div className={classes.item}>
          <TextField
            fullWidth
            disabled
            variant="filled"
            margin="none"
            label={fields.totalVolume.label}
            value={totalVolume}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{'MWh'}</InputAdornment>
              ),
            }}
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
