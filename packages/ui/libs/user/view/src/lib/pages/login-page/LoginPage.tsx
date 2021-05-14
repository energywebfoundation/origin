import React, { FC, memo } from 'react';

import { useStyles } from '../sign-in-page/SignInPage.styles';
import { Box, Button, Paper, Typography } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useLogInPageEffects } from './LoginPage.effects';
import { EnergyWebLogo } from '@energyweb/origin-ui-assets';

/* eslint-disable-next-line */
export interface LoginPageProps {
  handleNavigateToRegisterUserPage: () => void;
  handleNavigateToResetPasswordPage: () => void;
}

export const LoginPage: FC<LoginPageProps> = memo(
  ({ handleNavigateToRegisterUserPage, handleNavigateToResetPasswordPage }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { formConfig } = useLogInPageEffects();
    return (
      <Paper className={classes.paper}>
        <EnergyWebLogo />
        <GenericForm {...formConfig}>
          <Box>
            <Button variant="text" onClick={handleNavigateToResetPasswordPage}>
              {t('account.login.forgotPassword')}
            </Button>
          </Box>
        </GenericForm>
        <Box>
          <Typography>{t('account.login.dontHaveAcc')}</Typography>
          <Button onClick={handleNavigateToRegisterUserPage}>
            {t('account.login.registerNow')}
          </Button>
        </Box>
      </Paper>
    );
  }
);

export default LoginPage;
