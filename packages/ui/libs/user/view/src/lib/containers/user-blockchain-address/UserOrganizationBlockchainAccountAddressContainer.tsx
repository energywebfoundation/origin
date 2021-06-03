import React, { FC } from 'react';

import { Grid } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useUserBlockchainAccountAddressEffects } from './UserOrganizationBlockchainAddressContainer.effects';

export const UserOrganizationBlockchainAccountAddressContainer: FC = () => {
  const { formConfig } = useUserBlockchainAccountAddressEffects();
  return (
    <Grid container>
      <Grid item xs={12}>
        <GenericForm {...formConfig} />
      </Grid>
    </Grid>
  );
};
