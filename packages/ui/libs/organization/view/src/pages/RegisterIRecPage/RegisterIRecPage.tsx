import React, { FC } from 'react';
import { Paper } from '@material-ui/core';
import { MultiStepForm } from '@energyweb/origin-ui-core';
import { useStyles } from './RegisterIRecPage.styles';
import { useRegisterIRecPageEffects } from './RegisterIRecPage.effects';

export const RegisterIRecPage: FC = () => {
  const classes = useStyles();
  const { formData } = useRegisterIRecPageEffects();

  return (
    <Paper classes={{ root: classes.paper }}>
      <MultiStepForm {...formData} />
    </Paper>
  );
};
