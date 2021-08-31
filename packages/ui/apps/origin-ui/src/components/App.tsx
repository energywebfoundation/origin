import React, { FC, memo } from 'react';
import {
  MainLayout,
  PageNotFound,
  TMenuSection,
  TopBarButtonData,
} from '@energyweb/origin-ui-core';
import { LoginApp } from '@energyweb/origin-ui-user-view';
import { Routes, Route, Navigate } from 'react-router-dom';
import { initializeI18N } from '@energyweb/origin-ui-localization';
import { getOriginLanguage } from '@energyweb/origin-ui-shared-state';
import { AuthApp, AdminApp, AccountApp } from '@energyweb/origin-ui-user-view';
import { OrganizationApp } from '@energyweb/origin-ui-organization-view';
import { DeviceApp } from '@energyweb/origin-ui-device-view';
import { CertificateApp } from '@energyweb/origin-ui-certificate-view';
import { ExchangeApp } from '@energyweb/origin-ui-exchange-view';
import { useUserAndOrgData } from '@energyweb/origin-ui-user-logic';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { RoutesConfig } from '../AppContainer';

export interface AppProps {
  isAuthenticated: boolean;
  topbarButtons: TopBarButtonData[];
  user: UserDTO;
  menuSections: TMenuSection[];
  routesConfig: RoutesConfig;
}

initializeI18N(getOriginLanguage());

const App: FC<AppProps> = memo(
  ({ isAuthenticated, user, menuSections, topbarButtons, routesConfig }) => {
    const { orgData, userData } = useUserAndOrgData(user);
    const {
      accountRoutes,
      adminRoutes,
      orgRoutes,
      certificateRoutes,
      deviceRoutes,
      exchangeRoutes,
    } = routesConfig;

    return (
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout
              isAuthenticated={isAuthenticated}
              topbarButtons={topbarButtons}
              menuSections={menuSections}
              userData={userData}
              orgData={orgData}
            />
          }
        >
          <Route
            path="device/*"
            element={
              <DeviceApp
                routesConfig={deviceRoutes}
                envVariables={{
                  googleMapsApiKey: process.env.NX_GOOGLE_MAPS_API_KEY,
                  smartMeterId: process.env.NX_SMART_METER_ID,
                }}
              />
            }
          />
          <Route
            path="exchange/*"
            element={<ExchangeApp routesConfig={exchangeRoutes} />}
          />
          <Route
            path="certificate/*"
            element={
              <CertificateApp
                routesConfig={certificateRoutes}
                envVariables={{
                  googleMapsApiKey: process.env.NX_GOOGLE_MAPS_API_KEY,
                  exchangeWalletPublicKey: process.env.NX_EXCHANGE_WALLET_PUB,
                }}
              />
            }
          />
          <Route
            path="organization/*"
            element={<OrganizationApp routesConfig={orgRoutes} />}
          />
          <Route
            path="account/*"
            element={
              <AccountApp
                routesConfig={accountRoutes}
                envVariables={{
                  registrationMessage:
                    process.env.NX_REGISTRATION_MESSAGE_TO_SIGN,
                }}
              />
            }
          />
          <Route
            path="admin/*"
            element={<AdminApp routesConfig={adminRoutes} />}
          />
          <Route
            path="auth/*"
            element={
              <AuthApp routesConfig={{ showRegister: !isAuthenticated }} />
            }
          />

          <Route element={<Navigate to="device/all" />} />
        </Route>
        <Route path="/login" element={<LoginApp />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    );
  }
);

App.displayName = 'App';

export default App;
