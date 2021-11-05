import { PageNotFound } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@mui/material';
import React, { FC, lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const AdminUsersPage = lazy(
  () => import('./pages/AdminUsersPage/AdminUsersPage')
);
const AdminUpdateUserPage = lazy(
  () => import('./pages/AdminUpdateUserPage/AdminUpdateUserPage')
);
const AdminClaimsPage = lazy(
  () => import('./pages/AdminClaimsPage/AdminClaimsPage')
);

export interface AdminAppProps {
  routesConfig: {
    showClaims: boolean;
    showUsers: boolean;
  };
}

export const AdminApp: FC<AdminAppProps> = ({ routesConfig }) => {
  const { showClaims, showUsers } = routesConfig;
  return (
    <Routes>
      {showUsers && (
        <Route
          path="users"
          element={
            <Suspense fallback={<CircularProgress />}>
              <AdminUsersPage />
            </Suspense>
          }
        />
      )}
      {showUsers && (
        <Route
          path="update-user/:id"
          element={
            <Suspense fallback={<CircularProgress />}>
              <AdminUpdateUserPage />
            </Suspense>
          }
        />
      )}
      {showClaims && (
        <Route
          path="claims"
          element={
            <Suspense fallback={<CircularProgress />}>
              <AdminClaimsPage />
            </Suspense>
          }
        />
      )}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
