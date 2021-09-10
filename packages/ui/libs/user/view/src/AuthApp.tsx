import React, { FC } from 'react';

import { Route, Routes } from 'react-router';
import { RegisterPage } from './pages';
import { UserModalsProvider } from './context';
import { UserModalsCenter } from './containers/modals';
import { PageNotFound } from '@energyweb/origin-ui-core';

interface AuthAppProps {
  routesConfig: {
    showRegister: boolean;
  };
}

export const AuthApp: FC<AuthAppProps> = ({ routesConfig }) => {
  const { showRegister } = routesConfig;
  return (
    <UserModalsProvider>
      <Routes>
        {showRegister && <Route path="register" element={<RegisterPage />} />}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <UserModalsCenter />
    </UserModalsProvider>
  );
};
