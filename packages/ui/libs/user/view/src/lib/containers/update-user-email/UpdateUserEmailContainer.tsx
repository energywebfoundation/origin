import React from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { useUpdateUserEmailContainerEffects } from './UpdateUserEmailContainer.effects';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export interface UpdateUserEmailProps {
  userAccountData: UserDTO;
}

export const UpdateUserEmailContainer = ({
  userAccountData,
}: UpdateUserEmailProps) => {
  const { t } = useTranslation();

  const { formProps } = useUpdateUserEmailContainerEffects(userAccountData);

  return (
    <>
      <Typography variant="h5">{t('user.profile.changeEmailTitle')}</Typography>
      <GenericForm {...formProps} />
    </>
  );
};

export default UpdateUserEmailContainer;
