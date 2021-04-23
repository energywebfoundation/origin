// @should localize
import React, { FC } from 'react';
import { Paper } from '@material-ui/core';
import { MultiStepForm } from '@energyweb/origin-ui-core';

import { registerOrganizationForm } from '@energyweb/origin-ui-organization-logic';
import { submitOrganizationRegister } from '@energyweb/origin-ui-organization-data';

import { useStyles } from './RegisterPage.styles';

export const RegisterPage: FC = () => {
  const classes = useStyles();
  return (
    <Paper classes={{ root: classes.paper }}>
      <MultiStepForm
        heading="Register Organization"
        forms={registerOrganizationForm}
        submitHandler={submitOrganizationRegister}
      />
    </Paper>
  );
};
