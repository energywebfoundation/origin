import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DeviceModalsCenter } from './containers';
import { DeviceModalsProvider } from './context';
import {
  AllDevicesPage,
  MyDevicesPage,
  PendingPage,
  RegisterPage,
  MapViewPage,
  DetailViewPage,
  DeviceImportPage,
} from './pages';

export const DeviceApp: FC = () => {
  return (
    <DeviceModalsProvider>
      <Routes>
        <Route path="all" element={<AllDevicesPage />} />
        <Route path="map" element={<MapViewPage />} />
        <Route path="my" element={<MyDevicesPage />} />
        <Route path="pending" element={<PendingPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="detail-view/:id" element={<DetailViewPage />} />
        <Route path="import" element={<DeviceImportPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <DeviceModalsCenter />
    </DeviceModalsProvider>
  );
};
