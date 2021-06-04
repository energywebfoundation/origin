import React, { FC } from 'react';

import { Grid } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useUserBlockchainAccountAddressEffects } from './UserOrganizationBlockchainAddressContainer.effects';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

interface UserOrganizationBlockchainAccountAddressContainerProps {
  userAccountData: UserDTO;
}

export const UserOrganizationBlockchainAccountAddressContainer: FC<UserOrganizationBlockchainAccountAddressContainerProps> =
  ({ userAccountData }) => {
    const { formConfig } =
      useUserBlockchainAccountAddressEffects(userAccountData);
    return (
      <Grid item md={8} xs={12}>
        <GenericForm {...formConfig} />
      </Grid>
    );
  };
