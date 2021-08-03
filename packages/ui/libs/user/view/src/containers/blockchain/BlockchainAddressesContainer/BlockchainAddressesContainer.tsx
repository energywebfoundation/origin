import React from 'react';

import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { UserExchangeDepositAddress } from '../UserExchangeDepositAddress';
import { OrganizationBlockchainAddress } from '../OrganizationBlockchainAddress';

export const BlockchainAddressesContainer = () => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h5">
        {t('user.profile.blockchainAddresses')}
      </Typography>
      <UserExchangeDepositAddress />
      <OrganizationBlockchainAddress />
    </>
  );
};

export default BlockchainAddressesContainer;
