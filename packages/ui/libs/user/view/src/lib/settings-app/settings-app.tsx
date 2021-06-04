import React, { FC } from 'react';
import { Route, Routes } from 'react-router';
import UserSettingsPage from '../pages/user-settings-page/UserSettingsPage';
import UserAccountPage from '../pages/user-account-page/UserAccountPage';

/* eslint-disable-next-line */
export interface SettingsAppProps {}

export const SettingsApp: FC<SettingsAppProps> = (props) => {
  return (
    <Routes>
      <Route path="profile" element={<UserAccountPage />}>
        <UserSettingsPage />
      </Route>
      <Route path="settings" element={<UserSettingsPage />}>
        <UserSettingsPage />
      </Route>
    </Routes>
  );
};

export default SettingsApp;
