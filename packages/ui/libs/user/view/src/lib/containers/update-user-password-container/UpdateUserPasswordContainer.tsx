import React, { FC } from 'react';

import { UserDTO } from '@energyweb/origin-backend-react-query-client';

/* eslint-disable-next-line */
export interface UpdateUserPasswordContainerProps {
  user: UserDTO;
}

export const UpdateUserPasswordContainer: FC<UpdateUserPasswordContainerProps> = () => {
  return <h1>Welcome to UpdateUserPasswordContainer!</h1>;
};

export default UpdateUserPasswordContainer;
