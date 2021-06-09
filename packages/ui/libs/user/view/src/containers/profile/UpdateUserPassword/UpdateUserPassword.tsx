import React, { FC } from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { useUpdateUserPasswordEffects } from './UpdateUserPassword.effects';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';

export const UpdateUserPassword: FC = () => {
  const { t } = useTranslation();
  const { formProps } = useUpdateUserPasswordEffects();

  return (
    <>
      <Typography variant="h5">
        {t('user.profile.changePasswordTitle')}
      </Typography>
      <GenericForm {...formProps} />
    </>
  );
};
