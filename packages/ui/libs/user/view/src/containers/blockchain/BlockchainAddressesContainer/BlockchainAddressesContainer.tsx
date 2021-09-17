import React from 'react';

import { Paper, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { withMetamask } from '@energyweb/origin-ui-blockchain';
import { UserExchangeDepositAddress } from '../UserExchangeDepositAddress';
import { OrganizationBlockchainAddress } from '../OrganizationBlockchainAddress';
import { useStyles } from './BlockchainAddressesContainer.styles';

const Component = () => {
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

export const BlockchainAddressesContainer = withMetamask(Component);
