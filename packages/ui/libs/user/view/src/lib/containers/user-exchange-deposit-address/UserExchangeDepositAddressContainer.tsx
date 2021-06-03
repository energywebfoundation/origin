import React, { FC } from 'react';

import { Grid, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useStyles } from './UserExchangeDepositAddress.styles';
import { useUserExchangeDepositAddressEffects } from './UserExchangeDepositAddress.effects';

export const UserExchangeDepositAddressContainer: FC = () => {
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
