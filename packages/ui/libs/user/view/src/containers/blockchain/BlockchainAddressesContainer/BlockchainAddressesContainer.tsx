import React from 'react';

import { Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserExchangeDepositAddress } from '../UserExchangeDepositAddress';
import { OrganizationBlockchainAddress } from '../OrganizationBlockchainAddress';
import { useStyles } from './BlockchainAddressesContainer.styles';

export const BlockchainAddressesContainer = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Paper classes={{ root: classes.paper }}>
      <Typography variant="h5">
        {t('user.profile.blockchainAddresses')}
      </Typography>
      <UserExchangeDepositAddress />
      <OrganizationBlockchainAddress />
    </Paper>
  );
};
