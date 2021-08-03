import React, { FC } from 'react';

import { LoginPage } from './pages';
import { UserModalsProvider } from './context';
import { UserModalsCenter } from './containers/modals';

export const LoginApp: FC = () => {
  return (
    <UserModalsProvider>
      <LoginPage />
      <UserModalsCenter />
    </UserModalsProvider>
  );
};
