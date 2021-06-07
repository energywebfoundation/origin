import React, { FC } from 'react';
import { Route, Routes } from 'react-router';
import UserSettingsPage from '../pages/user-settings-page/UserSettingsPage';
import UserAccountPage from '../pages/user-account-page/UserAccountPage';

export const SettingsApp: FC = () => {
  return (
    <Routes>
      <Route path="profile" element={<UserAccountPage />} />
      <Route path="settings" element={<UserSettingsPage />} />
    </Routes>
  );
};

export default SettingsApp;
