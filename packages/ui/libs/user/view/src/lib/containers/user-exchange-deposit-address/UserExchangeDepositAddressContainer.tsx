import React, { FC } from 'react';

import { Grid } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useStyles } from './UserExchangeDepositAddress.styles';
import { useUserExchangeDepositAddressEffects } from './UserExchangeDepositAddress.effects';

export const UserExchangeDepositAddressContainer: FC = () => {
  const classes = useStyles();
  const { formConfig } = useUserExchangeDepositAddressEffects();
  return (
    <Grid item md={8} xs={12} className={classes.gridContainer}>
      <GenericForm {...formConfig} />
    </Grid>
  );
};
