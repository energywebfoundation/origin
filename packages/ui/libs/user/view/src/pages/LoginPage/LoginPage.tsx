import React, { FC, ReactNode } from 'react';

import { Box, Button, Paper, Typography } from '@mui/material';
import { EnergyWebLogo } from '@energyweb/origin-ui-assets';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { LoginPageLayout } from '../../containers';
import { useStyles } from './LoginPage.styles';
import { useLogInPageEffects } from './LoginPage.effects';

export interface LoginPageProps {
  bgImage?: string;
  formIcon?: ReactNode;
}

export const LoginPage: FC<LoginPageProps> = ({ bgImage, formIcon }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { formProps, navigateToRegister, navigateToResetPassword } =
    useLogInPageEffects();

  return (
    <LoginPageLayout bgImage={bgImage}>
      <Paper className={classes.paper}>
        {formIcon || <EnergyWebLogo />}
        <GenericForm {...formProps}>
          <Box>
            <Button variant="text" onClick={navigateToResetPassword}>
              {t('user.login.forgotPassword')}
            </Button>
          </Box>
        </GenericForm>
        <Box>
          <Typography>{t('user.login.dontHaveAcc')}</Typography>
          <Button data-cy="register-now-button" onClick={navigateToRegister}>
            {t('user.login.registerNow')}
          </Button>
        </Box>
      </Paper>
    </LoginPageLayout>
  );
};
