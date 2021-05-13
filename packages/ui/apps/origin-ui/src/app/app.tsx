import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { OrganizationApp } from '@energyweb/origin-ui-organization-view';
import { DeviceApp } from '@energyweb/origin-ui-device-view';
import { initializeI18N } from '@energyweb/origin-ui-utils';
import { getOriginLanguage } from '@energyweb/origin-ui-shared-state';

import { AppContainer } from '../components/AppContainer';

export function App() {
  // @should check if this is the best place for it
  initializeI18N(getOriginLanguage());

  return (
    <AppContainer>
      <Routes>
        <Route path="organization/*" element={<OrganizationApp />} />
        <Route path="device/*" element={<DeviceApp />} />
      </Routes>
    </AppContainer>
  );
}

export default App;
