import React, { FC } from 'react';

import { Grid } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useUserBlockchainAccountAddressEffects } from './UserOrganizationBlockchainAddressContainer.effects';

export const UserOrganizationBlockchainAccountAddressContainer: FC = () => {
  const { formConfig } = useUserBlockchainAccountAddressEffects();
  return (
    <Grid item md={8} xs={12}>
      <GenericForm {...formConfig} />
    </Grid>
  );
};
