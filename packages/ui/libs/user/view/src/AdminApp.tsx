import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';

import { Route, Routes } from 'react-router';
import { AdminUsersPage, AdminUpdateUserPage, AdminClaimsPage, AdminTradesPage } from './pages';

interface AdminAppProps {
  routesConfig: {
    showClaims: boolean;
    showUsers: boolean;
    showTrades: boolean;
  };
}

export const AdminApp: FC<AdminAppProps> = ({ routesConfig }) => {
  const { showClaims, showUsers, showTrades } = routesConfig;
  return (
    <Routes>
      {showUsers && <Route path="users" element={<AdminUsersPage />} />}
      {showUsers && (
        <Route path="update-user/:id" element={<AdminUpdateUserPage />} />
      )}
      {showClaims && <Route path="claims" element={<AdminClaimsPage />} />}
      {showTrades && <Route path="trades" element={<AdminTradesPage />} />}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
