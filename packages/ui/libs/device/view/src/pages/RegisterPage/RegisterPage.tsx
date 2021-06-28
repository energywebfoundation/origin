import { MultiStepForm } from '@energyweb/origin-ui-core';
import { Paper, CircularProgress } from '@material-ui/core';
import React from 'react';
import { useRegisterPageEffects } from './RegisterPage.effects';
import { useStyles } from './RegisterPage.styles';

export const RegisterPage: React.FC = () => {
  const { formProps, isLoading } = useRegisterPageEffects();
  const classes = useStyles();

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Paper classes={{ root: classes.paper }}>
      <MultiStepForm {...formProps} />
    </Paper>
  );
};
