import { GenericForm } from '@energyweb/origin-ui-core';
import { Paper } from '@mui/material';
import React, { FC } from 'react';
import { LoginPageLayout } from '../../containers';
import { useResetPasswordPageEffects } from './ResetPasswordPage.effects';
import { useStyles } from './ResetPasswordPage.styles';

export interface ResetPasswordPageProps {
  bgImage?: string;
}

export const ResetPasswordPage: FC<ResetPasswordPageProps> = ({ bgImage }) => {
  const { formProps } = useResetPasswordPageEffects();
  const classes = useStyles();
  return (
    <LoginPageLayout bgImage={bgImage}>
      <Paper className={classes.paper}>
        <GenericForm {...formProps} />
      </Paper>
    </LoginPageLayout>
  );
};
