import React from 'react';

import { GenericForm } from '@energyweb/origin-ui-core';
import { useUpdateUserDataContainerEffects } from './UpdateUserDataContainer.effects';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

/* eslint-disable-next-line */
export interface UpdateUserDataContainerProps {
  userAccountData: UserDTO;
}

export const UpdateUserDataContainer = ({
  userAccountData,
}: UpdateUserDataContainerProps) => {
  const { formConfig } = useUpdateUserDataContainerEffects(userAccountData);
  return <GenericForm twoColumns {...formConfig} />;
};

export default UpdateUserDataContainer;
