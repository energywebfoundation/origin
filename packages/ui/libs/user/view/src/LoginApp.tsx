import React, { FC, ReactNode } from 'react';

import { LoginPage } from './pages';
import { UserModalsProvider } from './context';
import { UserModalsCenter } from './containers/modals';

export interface LoginAppProps {
  loginPageBgImage?: string;
  loginFormIcon?: ReactNode;
}

export const LoginApp: FC<LoginAppProps> = ({
  loginPageBgImage,
  loginFormIcon,
}) => {
  return (
    <UserModalsProvider>
      <LoginPage bgImage={loginPageBgImage} formIcon={loginFormIcon} />
      <UserModalsCenter />
    </UserModalsProvider>
  );
};
