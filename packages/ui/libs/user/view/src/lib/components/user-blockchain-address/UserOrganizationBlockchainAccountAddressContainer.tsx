import React from 'react';

import { Grid } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useUserBlockchainAccountAddressEffects } from './UserOrganizationBlockchainAddressContainer.effects';

/* eslint-disable-next-line */
export interface UserBlockchainAccountAddressProps {}

export const UserOrganizationBlockchainAccountAddressContainer =
  ({}: UserBlockchainAccountAddressProps) => {
    const { formConfig } = useUserBlockchainAccountAddressEffects();
    return (
      <Grid container>
        <Grid item xs={12}>
          <GenericForm {...formConfig} />
        </Grid>
      </Grid>
    );
  };

export default UserOrganizationBlockchainAccountAddressContainer;
