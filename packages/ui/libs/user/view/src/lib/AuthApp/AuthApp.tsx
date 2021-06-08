import React, { FC } from 'react';

import { Route, Routes } from 'react-router';
import { LoginPage, RegisterPage } from '../pages';
import { UserModalsProvider } from '../context';
import { UserModalsCenter } from '../containers/modals';

export const AuthApp: FC = () => {
  return (
    <UserModalsProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Routes>
      <UserModalsCenter />
    </UserModalsProvider>
  );
};
