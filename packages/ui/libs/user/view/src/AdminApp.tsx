import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';

import { Route, Routes } from 'react-router';
import { AdminUsersPage, AdminUpdateUserPage, AdminClaimsPage } from './pages';

interface AdminAppProps {
  routesConfig: {
    showClaims: boolean;
    showUsers: boolean;
  };
}

export const AdminApp: FC<AdminAppProps> = ({ routesConfig }) => {
  const { showClaims, showUsers } = routesConfig;
  return (
    <Routes>
      {showUsers && <Route path="users" element={<AdminUsersPage />} />}
      {showUsers && (
        <Route path="update-user/:id" element={<AdminUpdateUserPage />} />
      )}
      {showClaims && <Route path="claims" element={<AdminClaimsPage />} />}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
