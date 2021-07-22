import {
  ListActionComponentProps,
  MaterialDatepicker,
  SelectRegular,
} from '@energyweb/origin-ui-core';
import { CircularProgress, Grid, TextField } from '@material-ui/core';
import React, { PropsWithChildren, ReactElement } from 'react';
import { CertificateActionContent } from '../../list';
import { useRetireActionEffects } from './RetireAction.effects';
import { useStyles } from './RetireAction.styles';

interface RetireActionProps<Id> extends ListActionComponentProps<Id> {}

export type TRetireAction = <Id>(
  props: PropsWithChildren<RetireActionProps<Id>>
) => ReactElement;

export const RetireAction: TRetireAction = ({ selectedIds, resetIds }) => {
  const classes = useStyles();
  const {
    title,
    buttonText,
    selectedItems,
    retireHandler,
    isLoading,
    selectedBeneficiaryId,
    buttonDisabled,
    selectorProps,
    startPickerProps,
    endPickerProps,
    purposeInputProps,
  } = useRetireActionEffects(selectedIds, resetIds);

  if (isLoading) return <CircularProgress />;

  return (
    <CertificateActionContent
      title={title}
      buttonText={buttonText}
      selectedIds={selectedIds}
      selectedItems={selectedItems}
      submitHandler={retireHandler}
      buttonDisabled={buttonDisabled}
    >
      <SelectRegular
        textFieldProps={{ margin: 'none', variant: 'filled' }}
        value={selectedBeneficiaryId}
        {...selectorProps}
      />
      <Grid container spacing={1} className={classes.mb}>
        <Grid item xs={6}>
          <MaterialDatepicker {...startPickerProps} />
        </Grid>
        <Grid item xs={6}>
          <MaterialDatepicker {...endPickerProps} />
        </Grid>
      </Grid>
      <TextField className={classes.mb} {...purposeInputProps} />
    </CertificateActionContent>
  );
};
