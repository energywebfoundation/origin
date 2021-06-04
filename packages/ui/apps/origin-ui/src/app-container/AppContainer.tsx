import React from 'react';

import App from '../components/app/app';
import { useAppContainerEffects } from './AppContainer.effects';
import { OriginGlobalStyles } from '../components/app/OriginGlobalStyles';
import { NotificationsCenter } from '@energyweb/origin-ui-core';
import { useAxiosInterceptors } from '@energyweb/origin-ui-react-query-providers';

export const AppContainer = () => {
  useAxiosInterceptors();

  const { topbarButtons, menuSections, user, isAuthenticated } =
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
      />
    </>
  );
};

export default AppContainer;
