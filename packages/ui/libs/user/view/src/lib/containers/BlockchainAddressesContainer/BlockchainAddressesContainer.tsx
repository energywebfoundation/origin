import React from 'react';

import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { UserExchangeDepositAddress } from '../UserExchangeDepositAddress';
import { UserOrganizationBlockchainAccountAddressContainer } from '../user-blockchain-address';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

interface BlockchainAddressesContainerProps {
  userAccountData: UserDTO;
}

export const BlockchainAddressesContainer = ({
  userAccountData,
}: BlockchainAddressesContainerProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h5">
        {t('user.profile.blockchainAddresses')}
      </Typography>
      <UserExchangeDepositAddress />
      {/* <UserOrganizationBlockchainAccountAddressContainer
        userAccountData={userAccountData}
      /> */}
    </>
  );
};

export default BlockchainAddressesContainer;
