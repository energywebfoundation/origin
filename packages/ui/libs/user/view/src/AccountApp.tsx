import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router';
import { SettingsPage, ProfilePage } from './pages';

export const AccountApp: FC = () => {
  return (
    <Routes>
      <Route path="profile" element={<ProfilePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
