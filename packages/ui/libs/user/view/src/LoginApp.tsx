import React, { FC, ReactNode } from 'react';

import { LoginPage } from './pages';
import { UserModalsProvider } from './context';
import { UserModalsCenter } from './containers/modals';
import { RequestResetPasswordPage } from './pages/RequestResetPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { Route, Routes } from 'react-router';

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
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage bgImage={loginPageBgImage} formIcon={loginFormIcon} />
          }
        />
        <Route
          path="request-password-reset"
          element={<RequestResetPasswordPage bgImage={loginPageBgImage} />}
        />
        <Route
          path="reset-password"
          element={<ResetPasswordPage bgImage={loginPageBgImage} />}
        />
      </Routes>
      <UserModalsCenter />
    </UserModalsProvider>
  );
};
