import React from 'react';

import { Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { UserExchangeDepositAddress } from '../UserExchangeDepositAddress';
import { getOrganizationBlockchainAddressComponent } from '../OrganizationBlockchainAddress';
import { useStyles } from './BlockchainAddressesContainer.styles';
import { useBlockchainAddressesEffects } from './BlockchainAddressesContainer.effects';
import { FullSelfOwnershipContainer } from '../FullSelfOwnershipContainer';

export const BlockchainAddressesContainer = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { userHasBlockchainAddressAttached } = useBlockchainAddressesEffects();
  const OrgBlockchainAddressComponent =
    getOrganizationBlockchainAddressComponent(userHasBlockchainAddressAttached);

  return (
    <Paper classes={{ root: classes.paper }}>
      <Typography variant="h5" component="span">
        {t('user.profile.blockchainAddresses')}
      </Typography>
      <UserExchangeDepositAddress />
      <OrgBlockchainAddressComponent />
      {userHasBlockchainAddressAttached ? <FullSelfOwnershipContainer /> : null}
    </Paper>
  );
};
