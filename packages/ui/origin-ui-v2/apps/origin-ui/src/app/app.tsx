import React from 'react';
import { ErrorFallback, MainLayout } from '@energyweb/origin-ui-core';
import { ErrorBoundary } from 'react-error-boundary';
import { OriginGlobalStyles } from './OriginGlobalStyles';
// import {
//   AuthProvider,
//   OriginQueryClientProvider,
// } from '@energy-web/origin-ui-api-clients';
import { topBarButtons, userAndOrgData } from '../__mocks__/mainLayout';
import { useAppEffects } from './App.effects';
import { Routes, Route } from 'react-router-dom';
import { OrganizationApp } from '@energyweb/origin-ui-organization-view';
import { DeviceApp } from '@energyweb/origin-ui-device-view';
import { initializeI18N } from '@energyweb/origin-ui-utils';
import { getOriginLanguage } from '@energyweb/origin-ui-shared-state';

export function App() {
  const { menuSections } = useAppEffects();

  initializeI18N(getOriginLanguage());

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* <OriginQueryClientProvider>
        <AuthProvider initialState={null}> */}
      <OriginGlobalStyles />
      <MainLayout
        topbarButtons={topBarButtons}
        menuSections={menuSections}
        userData={userAndOrgData.userData}
        orgData={userAndOrgData.orgData}
      >
        <Routes>
          <Route path="organization/*" element={<OrganizationApp />} />
          <Route path="device/*" element={<DeviceApp />} />
        </Routes>
      </MainLayout>
      {/* </AuthProvider>
      </OriginQueryClientProvider> */}
    </ErrorBoundary>
  );
}

export default App;
