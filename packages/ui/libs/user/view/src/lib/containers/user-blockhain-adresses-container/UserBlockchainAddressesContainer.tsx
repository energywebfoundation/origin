import React from 'react';

import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { UserExchangeDepositAddressContainer } from '../user-exchange-deposit-address';
import { UserOrganizationBlockchainAccountAddressContainer } from '../user-blockchain-address';

export const UserBlockchainAddressesContainer = () => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h5">
        {t('user.profile.blockchainAddresses')}
      </Typography>
      <UserExchangeDepositAddressContainer />
      <UserOrganizationBlockchainAccountAddressContainer />
    </>
  );
};

export default UserBlockchainAddressesContainer;
