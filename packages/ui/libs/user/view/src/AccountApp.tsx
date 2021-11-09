import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router';
import { UserAppEnvProvider, UserEnvVariables } from './context';
import { ProfilePage, SettingsPage } from './pages';

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
        {showUserProfile && <Route path="profile" element={<ProfilePage />} />}
        {showSettings && <Route path="settings" element={<SettingsPage />} />}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </UserAppEnvProvider>
  );
};
