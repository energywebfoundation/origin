import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DeviceModalsCenter } from './containers';
import {
  DeviceAppEnvProvider,
  DeviceEnvVariables,
  DeviceModalsProvider,
} from './context';
import {
  AllDevicesPage,
  MyDevicesPage,
  PendingPage,
  RegisterPage,
  MapViewPage,
  DetailViewPage,
  DeviceImportPage,
} from './pages';

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
          {showAllDevices && <Route path="all" element={<AllDevicesPage />} />}
          {showMapView && <Route path="map" element={<MapViewPage />} />}
          {showMyDevices && <Route path="my" element={<MyDevicesPage />} />}
          {showPendingDevices && (
            <Route path="pending" element={<PendingPage />} />
          )}
          {showRegisterDevice && (
            <Route path="register" element={<RegisterPage />} />
          )}
          {showAllDevices && (
            <Route path="detail-view/:id" element={<DetailViewPage />} />
          )}
          {showDeviceImport && (
            <Route path="import" element={<DeviceImportPage />} />
          )}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <DeviceModalsCenter />
      </DeviceModalsProvider>
    </DeviceAppEnvProvider>
  );
};
