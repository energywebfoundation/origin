import React, { FC } from 'react';
import { useStyles } from './RegisterPage.styles';
import { Paper } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useRegisterPageEffects } from './RegisterPage.effects';

export const RegisterPage: FC = () => {
  const classes = useStyles();
  const { formConfig } = useRegisterPageEffects();
  return (
    <Paper className={classes.paper}>
      <GenericForm {...formConfig} />
    </Paper>
  );
};
