import React, { FC } from 'react';
import { useStyles } from './SignInPage.styles';
import { Paper } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useSignInPageEffects } from './SignInPage.effects';

export const SignInPage: FC = () => {
  const classes = useStyles();
  const { formConfig } = useSignInPageEffects();
  return (
    <Paper className={classes.paper}>
      <GenericForm {...formConfig} />
    </Paper>
  );
};

export default SignInPage;
