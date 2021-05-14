import React from 'react';

import App from '../components/app/app';
import { useAppContainerEffects } from './AppContainer.effects';
import { OriginGlobalStyles } from '../components/app/OriginGlobalStyles';

/* eslint-disable-next-line */
export interface AppContainerProps {}

export const AppContainer = () => {
  const {
    navigate,
    menuSections,
    accountData,
    isAuthenticated,
  } = useAppContainerEffects();

  return (
    <>
      <OriginGlobalStyles />
      <App
        menuSections={menuSections}
        accountData={accountData}
        isAuthenticated={isAuthenticated}
        handleNavigate={navigate}
      />
    </>
  );
};

export default AppContainer;
