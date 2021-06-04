import React, { FC } from 'react';

import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useUpdateUserPasswordContainerEffects } from './UpdateUserPasswordContainer.effects';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';

export interface UpdateUserPasswordContainerProps {
  user: UserDTO;
}

export const UpdateUserPasswordContainer: FC<UpdateUserPasswordContainerProps> =
  () => {
    const { t } = useTranslation();

    const { formProps } = useUpdateUserPasswordContainerEffects();

    return (
      <>
        <Typography variant="h5">
          {t('user.profile.changePasswordTitle')}
        </Typography>
        <GenericForm {...formProps} />
      </>
    );
  };

export default UpdateUserPasswordContainer;
