import React, { useState } from 'react';
import { TopBar, NavBar, ErrorFallback } from '@energyweb/origin-ui-core';
import { Box } from '@material-ui/core';
import { ErrorBoundary } from 'react-error-boundary';
import { OriginGlobalStyles } from './OriginGlobalStyles';

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
          key: 'all-devices',
          label: 'All devices',
          component: <Box>All devices</Box>,
          show: true,
        },
        {
          key: 'my-devices',
          label: 'My devices',
          component: <Box>My devices</Box>,
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
          key: 'view-market',
          label: 'View Market',
          component: <Box>View Market</Box>,
          show: true,
        },
        {
          key: 'my-orders',
          label: 'My orders',
          component: <Box>My orders</Box>,
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
      <OriginGlobalStyles />
      <TopBar buttons={buttons} onMobileNavOpen={() => setnav(true)} />
      <NavBar
        openMobile={mobilenav}
        onMobileClose={() => setnav(false)}
        menuSections={menuSections}
        userData={userData}
        orgData={orgData}
      />
    </ErrorBoundary>
  );
}

export default App;
