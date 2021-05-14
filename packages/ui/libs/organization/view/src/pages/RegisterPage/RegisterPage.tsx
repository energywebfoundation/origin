import React, { FC } from 'react';
import { Paper } from '@material-ui/core';
import { MultiStepForm } from '@energyweb/origin-ui-core';
import { useRegisterPageEffects } from './RegisterPageEffects';
import { useStyles } from './RegisterPage.styles';

export const RegisterPage: FC = () => {
  const classes = useStyles();
  const { formData } = useRegisterPageEffects();

  return (
    <Paper classes={{ root: classes.paper }}>
      <MultiStepForm {...formData} />
    </Paper>
  );
};
