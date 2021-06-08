import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useUserResendConfirmationEmailEffects } from './UserResendConfirmationEmail.effects';

export const UserResendConfirmationEmail = () => {
  const { submitHandler, isLoading } = useUserResendConfirmationEmailEffects();
  const { t } = useTranslation();

  return (
    <Box>
      <Button disabled={isLoading} variant="contained" onClick={submitHandler}>
        {t('user.profile.resendConfirmationEmail')}
      </Button>
    </Box>
  );
};
