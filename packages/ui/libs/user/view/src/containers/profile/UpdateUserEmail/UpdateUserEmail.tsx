import React, { FC, memo } from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { useUpdateUserEmailEffects } from './UpdateUserEmail.effects';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export interface UpdateUserEmailProps {
  userAccountData: UserDTO;
}

export const UpdateUserEmail: FC<UpdateUserEmailProps> = memo(
  ({ userAccountData }) => {
    const { t } = useTranslation();

    const { formProps } = useUpdateUserEmailEffects(userAccountData);

    return (
      <>
        <Typography variant="h5">
          {t('user.profile.changeEmailTitle')}
        </Typography>
        <GenericForm {...formProps} />
      </>
    );
  }
);
