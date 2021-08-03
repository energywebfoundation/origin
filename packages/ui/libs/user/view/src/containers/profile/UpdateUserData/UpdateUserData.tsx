import React, { FC, memo } from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { useUpdateUserDataEffects } from './UpdateUserData.effects';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { UserResendConfirmationEmail } from '../UserResendConfirmationEmail';

export interface UpdateUserDataProps {
  userAccountData: UserDTO;
}

export const UpdateUserData: FC<UpdateUserDataProps> = memo(
  ({ userAccountData }) => {
    const { t } = useTranslation();
    const { formProps } = useUpdateUserDataEffects(userAccountData);
    return (
      <>
        <Typography variant="h5" gutterBottom>
          {t('user.profile.userInfoTitle')}
        </Typography>
        {userAccountData.email && !userAccountData.emailConfirmed && (
          <UserResendConfirmationEmail />
        )}
        <GenericForm {...formProps} />
      </>
    );
  }
);
