import React, { FC } from 'react';

import { Route, Routes } from 'react-router';
import { LoginPage, RegisterPage } from './pages';
import { UserModalsProvider } from './context';
import { UserModalsCenter } from './containers/modals';
import { PageNotFound } from '@energyweb/origin-ui-core';

export const AuthApp: FC = () => {
  return (
    <UserModalsProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <UserModalsCenter />
    </UserModalsProvider>
  );
};
