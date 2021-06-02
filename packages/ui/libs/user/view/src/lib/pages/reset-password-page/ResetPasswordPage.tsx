import React from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { useStyles } from '../sign-in-page/SignInPage.styles';
import { Paper } from '@material-ui/core';
import { useResetPasswordPageEffects } from './ResetPasswordPage.effects';

/* eslint-disable-next-line */
export interface ResetPasswordPageProps {}

export const ResetPasswordPage = () => {
  const classes = useStyles();
  const { formConfig } = useResetPasswordPageEffects();
  return (
    <Paper className={classes.paper}>
      <GenericForm {...formConfig} />
    </Paper>
  );
};
export default ResetPasswordPage;
