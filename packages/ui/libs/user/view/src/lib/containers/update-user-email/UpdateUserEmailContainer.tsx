import React from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { IUser } from '@energyweb/origin-backend-core';
import { useUpdateUserEmailContainerEffects } from './UpdateUserEmailContainer.effects';

/* eslint-disable-next-line */
export interface UpdateUserEmailProps {
  userAccountData: IUser;
}

export const UpdateUserEmailContainer = ({
  userAccountData,
}: UpdateUserEmailProps) => {
  const { formConfig } = useUpdateUserEmailContainerEffects(userAccountData);
  return <GenericForm {...formConfig} />;
};

export default UpdateUserEmailContainer;
