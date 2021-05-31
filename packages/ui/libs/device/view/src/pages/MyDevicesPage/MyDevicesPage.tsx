import { Skeleton } from '@material-ui/core';
import React, { FC } from 'react';
import { MyDeviceCardsList } from '../../containers';
import { useMyDevicePageEffects } from './MyDevicesPage.effects';

export const MyDevicesPage: FC = () => {
  const { myDevices, allDeviceTypes, isLoading } = useMyDevicePageEffects();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Skeleton width={1000} height={140} />
        <Skeleton width={1000} height={140} />
        <Skeleton width={1000} height={140} />
      </div>
    );
  }

  return (
    <MyDeviceCardsList allDeviceTypes={allDeviceTypes} devices={myDevices} />
  );
};
