import React from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { useUpdateUserDataContainerEffects } from './UpdateUserDataContainer.effects';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { UserResendConfirmationEmailContainer } from '../user-resend-confirmation-email-container/UserResendConfirmationEmailContainer';

export interface UpdateUserDataContainerProps {
  userAccountData: UserDTO;
}

export const UpdateUserDataContainer = ({
  userAccountData,
}: UpdateUserDataContainerProps) => {
  const { t } = useTranslation();
  const { formProps } = useUpdateUserDataContainerEffects(userAccountData);
  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t('user.profile.userInfoTitle')}
      </Typography>
      {userAccountData.email && !userAccountData.emailConfirmed && (
        <UserResendConfirmationEmailContainer />
      )}
      <GenericForm {...formProps} />
    </>
  );
};

export default UpdateUserDataContainer;
