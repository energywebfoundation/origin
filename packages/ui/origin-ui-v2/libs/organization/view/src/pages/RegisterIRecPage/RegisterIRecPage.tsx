// @should localize
import React, { FC } from 'react';
import { Paper } from '@material-ui/core';
import { MultiStepForm } from '@energyweb/origin-ui-core';

import { registerIRecForm } from '@energyweb/origin-ui-organization-logic';
import { submitIRecRegistration } from '@energyweb/origin-ui-organization-data';

import { useStyles } from './RegisterIRecPage.styles';

export const RegisterIRecPage: FC = () => {
  const classes = useStyles();
  return (
    <Paper classes={{ root: classes.paper }}>
      <MultiStepForm
        heading="Register Organization in I-REC"
        forms={registerIRecForm}
        submitHandler={submitIRecRegistration}
      />
    </Paper>
  );
};
