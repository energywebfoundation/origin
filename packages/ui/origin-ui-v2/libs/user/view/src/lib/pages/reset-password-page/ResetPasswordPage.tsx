import React from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { useStyles } from '../sign-in-page/SignInPage.styles';
import { useLogInPageEffects } from '../login-page/LoginPage.effects';
import { Paper } from '@material-ui/core';

/* eslint-disable-next-line */
export interface ResetPasswordPageProps {}

export const ResetPasswordPage = () => {
  const classes = useStyles();
  const { formConfig } = useLogInPageEffects();
  return (
    <Paper className={classes.paper}>
      <GenericForm {...formConfig} />
    </Paper>
  );
};
export default ResetPasswordPage;
