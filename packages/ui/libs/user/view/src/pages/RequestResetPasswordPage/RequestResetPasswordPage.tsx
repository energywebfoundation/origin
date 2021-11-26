import { GenericForm } from '@energyweb/origin-ui-core';
import { Paper } from '@mui/material';
import React, { FC } from 'react';
import { LoginPageLayout } from '../../containers';
import { useRequestResetPasswordPageEffects } from './RequestResetPasswordPage.effects';
import { useStyles } from './RequestResetPasswordPage.styles';

export interface RequestResetPasswordPageProps {
  bgImage?: string;
}

export const RequestResetPasswordPage: FC<RequestResetPasswordPageProps> = ({
  bgImage,
}) => {
  const { formProps } = useRequestResetPasswordPageEffects();
  const classes = useStyles();
  return (
    <LoginPageLayout bgImage={bgImage}>
      <Paper className={classes.paper}>
        <GenericForm {...formProps} />
      </Paper>
    </LoginPageLayout>
  );
};
