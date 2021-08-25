import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router';
import { SettingsPage, ProfilePage } from './pages';

interface AccountAppProps {
  routesConfig: {
    showUserProfile: boolean;
    showSettings: boolean;
  };
}

export const AccountApp: FC<AccountAppProps> = ({ routesConfig }) => {
  const { showUserProfile, showSettings } = routesConfig;
  return (
    <Routes>
      {showUserProfile && <Route path="profile" element={<ProfilePage />} />}
      {showSettings && <Route path="settings" element={<SettingsPage />} />}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
