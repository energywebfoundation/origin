import { PageNotFound } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@mui/material';
import React, { FC, lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { UserAppEnvProvider, UserEnvVariables } from './context';

const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage/SettingsPage'));

export interface AccountAppProps {
  routesConfig: {
    showUserProfile: boolean;
    showSettings: boolean;
  };
  envVariables: UserEnvVariables;
}

export const AccountApp: FC<AccountAppProps> = ({
  routesConfig,
  envVariables,
}) => {
  const { showUserProfile, showSettings } = routesConfig;
  return (
    <UserAppEnvProvider variables={envVariables}>
      <Routes>
        {showUserProfile && (
          <Route
            path="profile"
            element={
              <Suspense fallback={<CircularProgress />}>
                <ProfilePage />
              </Suspense>
            }
          />
        )}
        {showSettings && (
          <Route
            path="settings"
            element={
              <Suspense fallback={<CircularProgress />}>
                <SettingsPage />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </UserAppEnvProvider>
  );
};
