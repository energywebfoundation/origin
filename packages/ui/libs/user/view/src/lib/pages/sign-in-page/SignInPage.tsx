import React, { FC } from 'react';
import { useStyles } from './SignInPage.styles';
import { Paper } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useSignInPageEffects } from './SignInPage.effects';

/* eslint-disable-next-line */
export interface SignInPageProps {
  handleSuccess?: () => void;
}

export const SignInPage: FC<SignInPageProps> = () => {
  const classes = useStyles();
  const { formConfig } = useSignInPageEffects();
  return (
    <Paper className={classes.paper}>
      <GenericForm {...formConfig} />
    </Paper>
  );
};

export default SignInPage;
