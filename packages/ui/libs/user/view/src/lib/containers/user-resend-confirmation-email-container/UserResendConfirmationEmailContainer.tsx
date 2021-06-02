import React from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useUserResendConfirmationEmailContainerEffects } from './UserResendConfirmationEmailContainer.effects';

/* eslint-disable-next-line */
export interface UserResendConfirmationEmailContainerProps {}

export const UserResendConfirmationEmailContainer = () => {
  const { submitHandler, isLoading } =
    useUserResendConfirmationEmailContainerEffects();
  const { t } = useTranslation();
  return (
    <Box m={'20px'}>
      <Button
        disabled={isLoading}
        variant={'contained'}
        onClick={submitHandler}
      >
        {t('user.actions.resendConfirmationEmail')}
      </Button>
    </Box>
  );
};

export default UserResendConfirmationEmailContainer;
