import { Grid } from '@material-ui/core';
import React from 'react';
import { FC } from 'react';
import { SingleColumnForm, SingleColumnFormProps } from '../SingleColumnForm';

export interface DoubleColumnFormProps extends SingleColumnFormProps {}

export const DoubleColumnForm: FC<DoubleColumnFormProps> = ({
  fields,
  control,
  register,
  errors,
  dirtyFields,
  inputsVariant,
  inputsClass,
}) => {
  const firstSliceRange = Math.floor(fields.length / 2);
  const firstColumn = fields.slice(0, firstSliceRange);
  const secondColumn = fields.slice(firstSliceRange, fields.length);

  return (
    <Grid container spacing={3}>
      <Grid item sm={12} lg={6}>
        <SingleColumnForm
          fields={firstColumn}
          control={control}
          register={register}
          errors={errors}
          dirtyFields={dirtyFields}
          inputsVariant={inputsVariant}
          inputsClass={inputsClass}
        />
      </Grid>
      <Grid item sm={12} lg={6}>
        <SingleColumnForm
          fields={secondColumn}
          control={control}
          register={register}
          errors={errors}
          dirtyFields={dirtyFields}
          inputsVariant={inputsVariant}
          inputsClass={inputsClass}
        />
      </Grid>
    </Grid>
  );
};
