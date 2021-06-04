import React from 'react';

import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { UserExchangeDepositAddressContainer } from '../user-exchange-deposit-address';
import { UserOrganizationBlockchainAccountAddressContainer } from '../user-blockchain-address';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

interface UserBlockchainAddressesContainerProps {
  userAccountData: UserDTO;
}

export const UserBlockchainAddressesContainer = ({
  userAccountData,
}: UserBlockchainAddressesContainerProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h5">
        {t('user.profile.blockchainAddresses')}
      </Typography>
      <UserExchangeDepositAddressContainer />
      <UserOrganizationBlockchainAccountAddressContainer
        userAccountData={userAccountData}
      />
    </>
  );
};

export default UserBlockchainAddressesContainer;
