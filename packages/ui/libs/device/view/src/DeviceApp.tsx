import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  AllDevicesPage,
  MyDevicesPage,
  PendingPage,
  RegisterPage,
  MapViewPage,
  DetailViewPage,
} from './pages';

export const DeviceApp: FC = () => {
  return (
    <Routes>
      <Route path="all" element={<AllDevicesPage />} />
      <Route path="map" element={<MapViewPage />} />
      <Route path="my" element={<MyDevicesPage />} />
      <Route path="pending" element={<PendingPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="detail-view-mock" element={<DetailViewPage />} />
    </Routes>
  );
};
