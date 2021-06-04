import React from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { useUpdateUserEmailContainerEffects } from './UpdateUserEmailContainer.effects';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

export interface UpdateUserEmailProps {
  userAccountData: UserDTO;
}

export const UpdateUserEmailContainer = ({
  userAccountData,
}: UpdateUserEmailProps) => {
  const { formConfig } = useUpdateUserEmailContainerEffects(userAccountData);
  return <GenericForm {...formConfig} />;
};

export default UpdateUserEmailContainer;
