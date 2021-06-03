import React, { FC } from 'react';

import { useStyles } from './LoginPage.styles';
import { Box, Button, Paper, Typography } from '@material-ui/core';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useLogInPageEffects } from './LoginPage.effects';
import { EnergyWebLogo } from '@energyweb/origin-ui-assets';

export const LoginPage: FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { formConfig, navigateToRegister, navigateToResetPassword } =
    useLogInPageEffects();

  return (
    <Paper className={classes.paper}>
      <EnergyWebLogo />
      <GenericForm {...formConfig}>
        <Box>
          <Button variant="text" onClick={navigateToResetPassword}>
            {t('user.login.forgotPassword')}
          </Button>
        </Box>
      </GenericForm>
      <Box>
        <Typography>{t('user.login.dontHaveAcc')}</Typography>
        <Button onClick={navigateToRegister}>
          {t('user.login.registerNow')}
        </Button>
      </Box>
    </Paper>
  );
};

export default LoginPage;
