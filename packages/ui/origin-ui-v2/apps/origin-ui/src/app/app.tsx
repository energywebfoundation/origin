import React, { useState } from 'react';
import { TopBar, NavBar, ErrorFallback } from '@energyweb/origin-ui-core';
import { ErrorBoundary } from 'react-error-boundary';
import { OriginGlobalStyles } from './OriginGlobalStyles';
import {
  AuthProvider,
  OriginQueryClientProvider,
} from '@energy-web/origin-ui-api-clients';

export function App() {
  // Mock
  const buttons = [
    {
      label: 'Register',
      onClick: () => {
        console.log('Register clicked');
      },
    },
    {
      label: 'Login',
      onClick: () => {
        console.log('Login clicked');
      },
    },
  ];

  // Mock
  const menuSections = [
    {
      sectionTitle: 'Devices',
      show: true,
      rootUrl: '/devices',
      isOpen: true,
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
    {
      sectionTitle: 'Exchange',
      show: true,
      rootUrl: '/exchange',
      isOpen: false,
      menuList: [
        {
          url: 'view-market',
          label: 'View Market',
          show: true,
        },
        {
          url: 'my-orders',
          label: 'My orders',
          show: true,
        },
      ],
    },
  ];
  // Mock
  const userData = {
    username: 'John Doe',
  };
  // Mock
  const orgData = {
    orgName: 'World Trade Organization',
    orgPending: true,
    orgTooltip: 'Your organization status is Pending',
  };

  // Mock
  const [mobilenav, setnav] = useState(false);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <OriginQueryClientProvider>
        <AuthProvider initialState={null}>
          <OriginGlobalStyles />
          <TopBar buttons={buttons} onMobileNavOpen={() => setnav(true)} />
          <NavBar
            openMobile={mobilenav}
            onMobileClose={() => setnav(false)}
            menuSections={menuSections}
            userData={userData}
            orgData={orgData}
          />
        </AuthProvider>
      </OriginQueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
