import { Grid } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { SingleColumnForm, SingleColumnFormProps } from '../SingleColumnForm';
import { useDoubleColumnFormEffects } from './DoubleColumnForm.effects';
import { useStyles } from './DoubleColumnForm.styles';

export interface DoubleColumnFormProps extends SingleColumnFormProps {}

export type TDoubleColumnForm = (
  props: PropsWithChildren<SingleColumnFormProps>
) => ReactElement;

export const DoubleColumnForm: TDoubleColumnForm = ({
  fields,
  control,
  register,
  errors,
  dirtyFields,
  inputsVariant,
  formInputsProps,
}) => {
  const { firstColumn, secondColumn } = useDoubleColumnFormEffects(fields);
  const classes = useStyles();
  return (
    <Grid container>
      <Grid className={classes.item} item sm={12} lg={6}>
        <SingleColumnForm
          fields={firstColumn}
          control={control}
          register={register}
          errors={errors}
          dirtyFields={dirtyFields}
          inputsVariant={inputsVariant}
          formInputsProps={formInputsProps}
        />
      </Grid>
      <Grid className={classes.item} item sm={12} lg={6}>
        <SingleColumnForm
          fields={secondColumn}
          control={control}
          register={register}
          errors={errors}
          dirtyFields={dirtyFields}
          inputsVariant={inputsVariant}
          formInputsProps={formInputsProps}
        />
      </Grid>
    </Grid>
  );
};
