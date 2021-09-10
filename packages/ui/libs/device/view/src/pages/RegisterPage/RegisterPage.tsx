import React from 'react';
import { MultiStepForm, Requirements } from '@energyweb/origin-ui-core';
import { Paper, CircularProgress } from '@material-ui/core';
import { useRegisterPageEffects } from './RegisterPage.effects';
import { useStyles } from './RegisterPage.styles';

export const RegisterPage: React.FC = () => {
  const {
    formProps,
    isMutating,
    isLoading,
    canAccessPage,
    requirementsProps,
  } = useRegisterPageEffects();
  const classes = useStyles();

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!canAccessPage) {
    return <Requirements {...requirementsProps} />;
  }

  return (
    <Paper classes={{ root: classes.paper }}>
      <MultiStepForm loading={isMutating} {...formProps} />
    </Paper>
  );
};
