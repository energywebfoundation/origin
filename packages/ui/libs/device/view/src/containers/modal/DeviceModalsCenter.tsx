import React, { FC } from 'react';
import { ConfirmEditModal } from './ConfirmEditModal';
import { ImportDeviceModal } from './ImportDeviceModal';

export const DeviceModalsCenter: FC = () => {
  return (
    <>
      <ImportDeviceModal />
      <ConfirmEditModal />
    </>
  );
};
