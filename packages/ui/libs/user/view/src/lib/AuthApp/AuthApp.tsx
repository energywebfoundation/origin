import React, { FC } from 'react';

import { Route, Routes } from 'react-router';
import LoginPage from '../pages/login-page/LoginPage';
import SignInPage from '../pages/RegisterPage/RegisterPage';
import { UserModalsProvider } from '../context';
import { UserModalsCenter } from '../containers/modals';

export const AuthApp: FC = () => {
  return (
    <UserModalsProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<SignInPage />} />
      </Routes>
      <UserModalsCenter />
    </UserModalsProvider>
  );
};
