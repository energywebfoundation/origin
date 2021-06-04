import React from 'react';

import App from '../components/app/app';
import { useAppContainerEffects } from './AppContainer.effects';
import { OriginGlobalStyles } from '../components/app/OriginGlobalStyles';
import { NotificationsCenter } from '@energyweb/origin-ui-core';

export const AppContainer = () => {
  const { handleLogout, menuSections, accountData, isAuthenticated } =
    useAppContainerEffects();

  return (
    <>
      <OriginGlobalStyles />
      <NotificationsCenter />
      <App
        menuSections={menuSections}
        accountData={accountData}
        isAuthenticated={isAuthenticated}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default AppContainer;
