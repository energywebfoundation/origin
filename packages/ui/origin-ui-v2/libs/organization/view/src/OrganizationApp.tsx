import React, { FC } from 'react';
import { Routes, Route } from 'react-router';
import { RegisterPage, RegisterIRecPage } from './pages';

export const OrganizationApp: FC = () => {
  return (
    <Routes>
      <Route path="register" element={<RegisterPage />} />
      <Route path="register-irec" element={<RegisterIRecPage />} />
    </Routes>
  );
};
