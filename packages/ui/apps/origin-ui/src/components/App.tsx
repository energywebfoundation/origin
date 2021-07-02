import React, { FC } from 'react';
import {
  MainLayout,
  PageNotFound,
  TMenuSection,
  TopBarButtonData,
} from '@energyweb/origin-ui-core';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initializeI18N } from '@energyweb/origin-ui-utils';
import { getOriginLanguage } from '@energyweb/origin-ui-shared-state';
import { AuthApp, AdminApp, AccountApp } from '@energyweb/origin-ui-user-view';
import { OrganizationApp } from '@energyweb/origin-ui-organization-view';
import { DeviceApp } from '@energyweb/origin-ui-device-view';
import { CertificateApp } from '@energyweb/origin-ui-certificate-view';
import { ExchangeApp } from '@energyweb/origin-ui-exchange-view';
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
        <Route path="exchange/*" element={<ExchangeApp />} />
        <Route path="certificate/*" element={<CertificateApp />} />
        <Route path="organization/*" element={<OrganizationApp />} />
        <Route path="auth/*" element={<AuthApp />} />
        <Route path="account/*" element={<AccountApp />} />
        <Route path="admin/*" element={<AdminApp />} />

        <Route element={<Navigate to="device/all" />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </MainLayout>
  );
};
