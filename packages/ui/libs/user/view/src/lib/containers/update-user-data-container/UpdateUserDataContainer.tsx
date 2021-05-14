import React from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { IUser } from '@energyweb/origin-backend-core';
import { useUpdateUserDataContainerEffects } from './UpdateUserDataContainer.effects';

/* eslint-disable-next-line */
export interface UpdateUserDataContainerProps {
  userAccountData: IUser;
}

export const UpdateUserDataContainer = ({
  userAccountData,
}: UpdateUserDataContainerProps) => {
  const { formConfig } = useUpdateUserDataContainerEffects(userAccountData);
  return <GenericForm twoColumns {...formConfig} />;
};

export default UpdateUserDataContainer;
