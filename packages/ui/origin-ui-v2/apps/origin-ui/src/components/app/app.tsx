import React, { FC, useMemo } from 'react';
import { MainLayout, TMenuSection } from '@energyweb/origin-ui-core';
import { Routes, Route } from 'react-router-dom';
import { initializeI18N } from '@energyweb/origin-ui-utils';
import { getOriginLanguage } from '@energyweb/origin-ui-shared-state';
import {
  AuthApp,
  AdminApp,
  SettingsApp,
  IAccountContextState,
} from '@energyweb/origin-ui-user-view';
import { getUserAndOrgData } from '@energyweb/origin-ui-user-data-access';
import { getTopBarButtonList } from '@energyweb/origin-ui-user-logic';

/* eslint-disable-next-line */
export interface AppProps {
  isAuthenticated: boolean;
  accountData: IAccountContextState;
  menuSections: TMenuSection[];
  handleNavigate: (url: string) => void;
}

initializeI18N(getOriginLanguage());

export const App: FC<AppProps> = (props) => {
  const { isAuthenticated, accountData, menuSections, handleNavigate } = props;
  const { orgData, userData } = getUserAndOrgData(accountData);
  return (
    <MainLayout
      isAuthenticated={isAuthenticated}
      topbarButtons={useMemo(
        () =>
          getTopBarButtonList(isAuthenticated, () => {
            handleNavigate('/auth/logout');
          }),
        [isAuthenticated]
      )}
      menuSections={menuSections}
      userData={userData}
      orgData={orgData}
    >
      <Routes>
        <Route path={'auth/*'} element={<AuthApp />} />
        <Route path={'account/*'} element={<SettingsApp />} />
        <Route path={'admin/*'} element={<AdminApp />} />
        {/*<Route path="organization/*" element={<OrganizationApp />} />*/}
      </Routes>
    </MainLayout>
  );
};

export default App;
