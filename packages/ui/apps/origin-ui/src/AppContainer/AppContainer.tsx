import React from 'react';
import { NotificationsCenter } from '@energyweb/origin-ui-core';

import App from '../components/App';
import { OriginGlobalStyles } from '../components';
import { useAppContainerEffects } from './AppContainer.effects';

export const AppContainer = () => {
  const { topbarButtons, menuSections, user, isAuthenticated, routesConfig } =
    useAppContainerEffects();

  return (
    <>
      <OriginGlobalStyles />
      <NotificationsCenter />
      <App
        menuSections={menuSections}
        user={user}
        isAuthenticated={isAuthenticated}
        topbarButtons={topbarButtons}
        routesConfig={routesConfig}
      />
    </>
  );
};
