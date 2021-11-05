import { PageNotFound } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@mui/material';
import React, { FC, lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DeviceModalsCenter } from './containers';
import {
  DeviceAppEnvProvider,
  DeviceEnvVariables,
  DeviceModalsProvider,
} from './context';

const AllDevicesPage = lazy(
  () => import('./pages/AllDevicesPage/AllDevicesPage')
);
const MapViewPage = lazy(() => import('./pages/MapViewPage/MapViewPage'));
const MyDevicesPage = lazy(() => import('./pages/MyDevicesPage/MyDevicesPage'));
const PendingPage = lazy(() => import('./pages/PendingPage/PendingPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage/RegisterPage'));
const DetailViewPage = lazy(
  () => import('./pages/DetailViewPage/DetailViewPage')
);
const DeviceImportPage = lazy(
  () => import('./pages/DeviceImportPage/DeviceImportPage')
);

export interface DeviceAppProps {
  routesConfig: {
    showAllDevices: boolean;
    showMapView: boolean;
    showMyDevices: boolean;
    showPendingDevices: boolean;
    showRegisterDevice: boolean;
    showDeviceImport: boolean;
  };
  envVariables: DeviceEnvVariables;
}

export const DeviceApp: FC<DeviceAppProps> = ({
  routesConfig,
  envVariables,
}) => {
  const {
    showAllDevices,
    showMapView,
    showMyDevices,
    showPendingDevices,
    showRegisterDevice,
    showDeviceImport,
  } = routesConfig;
  return (
    <DeviceAppEnvProvider variables={envVariables}>
      <DeviceModalsProvider>
        <Routes>
          {showAllDevices && (
            <Route
              path="all"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <AllDevicesPage />
                </Suspense>
              }
            />
          )}
          {showMapView && (
            <Route
              path="map"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <MapViewPage />
                </Suspense>
              }
            />
          )}
          {showMyDevices && (
            <Route
              path="my"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <MyDevicesPage />
                </Suspense>
              }
            />
          )}
          {showPendingDevices && (
            <Route
              path="pending"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <PendingPage />
                </Suspense>
              }
            />
          )}
          {showRegisterDevice && (
            <Route
              path="register"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <RegisterPage />
                </Suspense>
              }
            />
          )}
          {showAllDevices && (
            <Route
              path="detail-view/:id"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <DetailViewPage />
                </Suspense>
              }
            />
          )}
          {showDeviceImport && (
            <Route
              path="import"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <DeviceImportPage />
                </Suspense>
              }
            />
          )}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <DeviceModalsCenter />
      </DeviceModalsProvider>
    </DeviceAppEnvProvider>
  );
};
