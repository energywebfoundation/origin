import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router';
import {
  AdminAllOrganizationsPage,
  AdminClaimsPage,
  AdminTradesPage,
  AdminUpdateUserPage,
  AdminUsersPage,
  AdminOrganizationViewPage,
} from './pages';

export interface AdminAppProps {
  routesConfig: {
    showClaims: boolean;
    showUsers: boolean;
    showAllOrgs: boolean;
    showTrades: boolean;
  };
}

export const AdminApp: FC<AdminAppProps> = ({ routesConfig }) => {
  const { showClaims, showUsers, showTrades, showAllOrgs } = routesConfig;
  return (
    <Routes>
      {showUsers && <Route path="users" element={<AdminUsersPage />} />}
      {showUsers && (
        <Route path="update-user/:id" element={<AdminUpdateUserPage />} />
      )}
      {showAllOrgs && (
        <Route path="organizations" element={<AdminAllOrganizationsPage />} />
      )}
      {showClaims && <Route path="claims" element={<AdminClaimsPage />} />}
      {showTrades && <Route path="trades" element={<AdminTradesPage />} />}
      {showAllOrgs && (
        <Route
          path="organization/:id"
          element={<AdminOrganizationViewPage />}
        />
      )}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
