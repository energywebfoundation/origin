import React from 'react';

import { App, OriginGlobalStyles } from '../components';
import { useAppContainerEffects } from './AppContainer.effects';
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
