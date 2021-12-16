import React, { FC, ReactNode } from 'react';
import { Route, Routes } from 'react-router';
import { PageNotFound } from '@energyweb/origin-ui-core';

import {
  LoginPage,
  RequestResetPasswordPage,
  ResetPasswordPage,
} from './pages';
import { UserModalsProvider } from './context';
import { UserModalsCenter } from './containers/modals';

export type LoginRoutesConfig = {
  showLoginPage: boolean;
  showRequestResetPasswordPage: boolean;
  showResetPasswordPage: boolean;
};

export interface LoginAppProps {
  routesConfig: LoginRoutesConfig;
  loginPageBgImage?: string;
  loginFormIcon?: ReactNode;
}

export const LoginApp: FC<LoginAppProps> = ({
  routesConfig,
  loginPageBgImage,
  loginFormIcon,
}) => {
  const { showLoginPage, showRequestResetPasswordPage, showResetPasswordPage } =
    routesConfig;

  return (
    <UserModalsProvider>
      <Routes>
        {showLoginPage && (
          <Route
            path="/"
            element={
              <LoginPage bgImage={loginPageBgImage} formIcon={loginFormIcon} />
            }
          />
        )}
        {showRequestResetPasswordPage && (
          <Route
            path="request-password-reset"
            element={<RequestResetPasswordPage bgImage={loginPageBgImage} />}
          />
        )}
        {showResetPasswordPage && (
          <Route
            path="reset-password"
            element={<ResetPasswordPage bgImage={loginPageBgImage} />}
          />
        )}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <UserModalsCenter />
    </UserModalsProvider>
  );
};
