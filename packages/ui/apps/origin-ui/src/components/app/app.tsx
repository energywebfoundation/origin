import React, { FC } from 'react';
import {
  MainLayout,
  TMenuSection,
  TopBarButtonData,
} from '@energyweb/origin-ui-core';
import { Routes, Route } from 'react-router-dom';
import { initializeI18N } from '@energyweb/origin-ui-utils';
import { getOriginLanguage } from '@energyweb/origin-ui-shared-state';
import { AuthApp, AdminApp, AccountApp } from '@energyweb/origin-ui-user-view';
import { OrganizationApp } from '@energyweb/origin-ui-organization-view';
import { DeviceApp } from '@energyweb/origin-ui-device-view';
import { useUserAndOrgData } from '@energyweb/origin-ui-user-logic';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

export interface AppProps {
  isAuthenticated: boolean;
  topbarButtons: TopBarButtonData[];
  user: UserDTO;
  menuSections: TMenuSection[];
}

initializeI18N(getOriginLanguage());

export const App: FC<AppProps> = ({
  isAuthenticated,
  user,
  menuSections,
  topbarButtons,
}) => {
  const { orgData, userData } = useUserAndOrgData(user);

  return (
    <MainLayout
      isAuthenticated={isAuthenticated}
      topbarButtons={topbarButtons}
      menuSections={menuSections}
      userData={userData}
      orgData={orgData}
    >
      <Routes>
        <Route path="device/*" element={<DeviceApp />} />
        <Route path="organization/*" element={<OrganizationApp />} />
        <Route path="auth/*" element={<AuthApp />} />
        <Route path="account/*" element={<AccountApp />} />
        <Route path="admin/*" element={<AdminApp />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
