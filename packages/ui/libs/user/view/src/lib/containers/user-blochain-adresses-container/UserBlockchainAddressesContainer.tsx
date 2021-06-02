import React from 'react';

import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import UserExchangeDepositAddressContainer from '../../components/user-exchange-deposit-address/UserExchangeDepositAddressContainer';
import UserOrganizationBlockchainAccountAddressContainer from '../../components/user-blockchain-address/UserOrganizationBlockchainAccountAddressContainer';

/* eslint-disable-next-line */
export interface UserBlockchainAddressesContainerProps {}

export const UserBlockchainAddressesContainer =
  ({}: UserBlockchainAddressesContainerProps) => {
    const { t } = useTranslation();
    return (
      <>
        <Typography variant="h5">
          {t('user.properties.blockchainAddresses')}
        </Typography>
        <UserExchangeDepositAddressContainer />
        <UserOrganizationBlockchainAccountAddressContainer />
      </>
    );
  };

export default UserBlockchainAddressesContainer;
