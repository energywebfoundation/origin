import React, { FC } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import {
  ErrorFallback,
  MainLayout,
  NotificationsCenter,
} from '@energyweb/origin-ui-core';

import { OriginGlobalStyles } from './OriginGlobalStyles';
import { useAppContainerEffects } from './AppContainer.effects';

import { topBarButtons } from '../__mocks__/mainLayout';

export const AppContainer: FC = ({ children: routes }) => {
  // @should provide a better fallback for loading the app
  const { menuSections, userData, orgData } = useAppContainerEffects();
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <OriginGlobalStyles />
      <NotificationsCenter />
      <MainLayout
        topbarButtons={topBarButtons}
        menuSections={menuSections}
        userData={userData}
        orgData={orgData}
      >
        {routes}
      </MainLayout>
    </ErrorBoundary>
  );
};
