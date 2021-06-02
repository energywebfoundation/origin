import React, { FC } from 'react';

import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { GenericForm } from '@energyweb/origin-ui-core';
import { useUpdateUserPasswordContainerEffects } from './UpdateUserPasswordContainer.effects';

/* eslint-disable-next-line */
export interface UpdateUserPasswordContainerProps {
  user: UserDTO;
}

export const UpdateUserPasswordContainer: FC<UpdateUserPasswordContainerProps> =
  () => {
    const { formConfig } = useUpdateUserPasswordContainerEffects();
    return <GenericForm {...formConfig} />;
  };

export default UpdateUserPasswordContainer;
