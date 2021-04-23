import React from 'react';
import { ErrorFallback, MainLayout } from '@energyweb/origin-ui-core';
import { ErrorBoundary } from 'react-error-boundary';
import { OriginGlobalStyles } from './OriginGlobalStyles';
import { topBarButtons, userAndOrgData } from '../__mocks__/mainLayout';
import { useAppEffects } from './App.effects';
import { Routes, Route } from 'react-router-dom';
import { OrganizationApp } from '@energyweb/origin-ui-organization-view';
import { initializeI18N } from '@energyweb/origin-ui-utils';
import { getOriginLanguage } from '@energyweb/origin-ui-shared-state';

export function App() {
  const { orgMenu } = useAppEffects();

  // Mock
  const menuSections = [
    orgMenu,
    {
      sectionTitle: 'Devices',
      show: true,
      rootUrl: '/devices',
      menuList: [
        {
          url: 'all-devices',
          label: 'All devices',
          show: true,
        },
        {
          url: 'my-devices',
          label: 'My devices',
          show: true,
        },
      ],
    },
  ];

  initializeI18N(getOriginLanguage());

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <OriginGlobalStyles />
      <MainLayout
        topbarButtons={topBarButtons}
        menuSections={menuSections}
        userData={userAndOrgData.userData}
        orgData={userAndOrgData.orgData}
      >
        <Routes>
          <Route path="organization/*" element={<OrganizationApp />} />
        </Routes>
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App;
