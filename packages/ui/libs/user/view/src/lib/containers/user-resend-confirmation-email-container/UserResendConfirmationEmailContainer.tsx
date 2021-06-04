import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useUserResendConfirmationEmailContainerEffects } from './UserResendConfirmationEmailContainer.effects';

export const UserResendConfirmationEmailContainer = () => {
  const { submitHandler, isLoading } =
    useUserResendConfirmationEmailContainerEffects();
  const { t } = useTranslation();

  return (
    <Box>
      <Button disabled={isLoading} variant="contained" onClick={submitHandler}>
        {t('user.profile.resendConfirmationEmail')}
      </Button>
    </Box>
  );
};

export default UserResendConfirmationEmailContainer;
