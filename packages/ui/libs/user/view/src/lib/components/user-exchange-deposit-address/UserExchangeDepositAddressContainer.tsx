import React from 'react';

import { Grid, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useStyles } from './UserExchangeDepositAddress.styles';
import { useUserExchangeDepositAddressEffects } from './UserExchangeDepositAddress.effects';

/* eslint-disable-next-line */
export interface UserExchangeDepositAddressContainerProps {}

export const UserExchangeDepositAddressContainer =
  ({}: UserExchangeDepositAddressContainerProps) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const { formConfig } = useUserExchangeDepositAddressEffects();
    return (
      <Grid item className={classes.gridContainer}>
        <Typography variant="h6">
          {t('user.properties.exchangeAddressTitle')}
        </Typography>
        <GenericForm {...formConfig} />
      </Grid>
    );
  };

export default UserExchangeDepositAddressContainer;
