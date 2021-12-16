import React, { FC, memo, Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import {
  MainLayout,
  PageNotFound,
  TMenuSection,
  TopBarButtonData,
} from '@energyweb/origin-ui-core';
import {
  ThemeModeEnum,
  useThemeModeDispatch,
  useThemeModeStore,
} from '@energyweb/origin-ui-theme';
import { initializeI18N } from '@energyweb/origin-ui-localization';
import { getOriginLanguage } from '@energyweb/origin-ui-shared-state';
import { useUserAndOrgData } from '@energyweb/origin-ui-user-logic';
import { RoutesConfig } from '../AppContainer';
import { useStyles } from './App.styles';

const DeviceApp = lazy(() => import('../../routes/Device'));
const CertificateApp = lazy(() => import('../../routes/Certificate'));
const ExchangeApp = lazy(() => import('../../routes/Exchange'));
const OrganizationApp = lazy(() => import('../../routes/Organization'));
const AccountApp = lazy(() => import('../../routes/Account'));
const AdminApp = lazy(() => import('../../routes/Admin'));
const AuthApp = lazy(() => import('../../routes/Auth'));
const LoginApp = lazy(() => import('../../routes/Login'));
const ConfirmEmailApp = lazy(() => import('../../routes/ConfirmEmail'));

export interface AppProps {
  isAuthenticated: boolean;
  topbarButtons: TopBarButtonData[];
  user: UserDTO;
  menuSections: TMenuSection[];
  routesConfig: RoutesConfig;
  loading: boolean;
}

initializeI18N(getOriginLanguage());

export const App: FC<AppProps> = memo(
  ({
    isAuthenticated,
    user,
    menuSections,
    topbarButtons,
    routesConfig,
    loading,
  }) => {
    const classes = useStyles();
    const { orgData, userData } = useUserAndOrgData(user);
    const {
      accountRoutes,
      adminRoutes,
      orgRoutes,
      certificateRoutes,
      deviceRoutes,
      exchangeRoutes,
      loginRoutes,
    } = routesConfig;
    const themeMode = useThemeModeStore();
    const isLightTheme = themeMode === ThemeModeEnum.Light;
    const changeThemeMode = useThemeModeDispatch();
    const allowedChainIds = (window as any).config.SUPPORTED_NETWORK_IDS.split(
      ';'
    ).map((id: string) => Number(id));
    return (
      <>
        {loading ? (
          <Box
            sx={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <MainLayout
                  themeSwitcher
                  themeMode={themeMode}
                  changeThemeMode={changeThemeMode}
                  isAuthenticated={isAuthenticated}
                  topbarButtons={topbarButtons}
                  menuSections={menuSections}
                  userData={userData}
                  orgData={orgData}
                  navBarPaperProps={
                    isLightTheme ? { className: classes.navPaper } : undefined
                  }
                  topBarClassName={isLightTheme ? classes.topBar : undefined}
                />
              }
            >
              <Route
                path="device/*"
                element={
                  <Suspense fallback={<CircularProgress />}>
                    <DeviceApp
                      routesConfig={deviceRoutes}
                      envVariables={{
                        singleAccountMode: /true/i.test(
                          process.env.NX_SINGLE_ACCOUNT_MODE
                        ),
                        googleMapsApiKey: process.env.NX_GOOGLE_MAPS_API_KEY,
                        smartMeterId: process.env.NX_SMART_METER_ID,
                      }}
                    />
                  </Suspense>
                }
              />
              <Route
                path="exchange/*"
                element={
                  <Suspense fallback={<CircularProgress />}>
                    <ExchangeApp routesConfig={exchangeRoutes} />
                  </Suspense>
                }
              />
              <Route
                path="certificate/*"
                element={
                  <Suspense fallback={<CircularProgress />}>
                    <CertificateApp
                      routesConfig={certificateRoutes}
                      envVariables={{
                        allowedChainIds,
                        googleMapsApiKey: process.env.NX_GOOGLE_MAPS_API_KEY,
                        exchangeWalletPublicKey:
                          process.env.NX_EXCHANGE_WALLET_PUB,
                      }}
                    />
                  </Suspense>
                }
              />
              <Route
                path="organization/*"
                element={
                  <Suspense fallback={<CircularProgress />}>
                    <OrganizationApp routesConfig={orgRoutes} />
                  </Suspense>
                }
              />
              <Route
                path="account/*"
                element={
                  <Suspense fallback={<CircularProgress />}>
                    <AccountApp
                      routesConfig={accountRoutes}
                      envVariables={{
                        allowedChainIds,
                        registrationMessage:
                          process.env.NX_REGISTRATION_MESSAGE_TO_SIGN,
                      }}
                    />
                  </Suspense>
                }
              />
              <Route
                path="admin/*"
                element={
                  <Suspense fallback={<CircularProgress />}>
                    <AdminApp routesConfig={adminRoutes} />
                  </Suspense>
                }
              />
              <Route
                path="auth/*"
                element={
                  <Suspense fallback={<CircularProgress />}>
                    <AuthApp
                      routesConfig={{ showRegister: !isAuthenticated }}
                    />
                  </Suspense>
                }
              />

              <Route path="/" element={<Navigate to="device/all" />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>
            <Route
              path="/login/*"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <LoginApp routesConfig={loginRoutes} />
                </Suspense>
              }
            />
            <Route
              path="/confirm-email"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <ConfirmEmailApp />
                </Suspense>
              }
            />
          </Routes>
        )}
      </>
    );
  }
);

App.displayName = 'App';
