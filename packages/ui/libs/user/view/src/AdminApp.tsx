import { PageNotFound } from '@energyweb/origin-ui-core';
import React from 'react';

import { Route, Routes } from 'react-router';
import { AdminUsersPage, AdminUpdateUserPage, AdminClaimsPage } from './pages';

export const AdminApp = () => {
  return (
    <Routes>
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="update-user/:id" element={<AdminUpdateUserPage />} />
      <Route path="claims" element={<AdminClaimsPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
