import { Skeleton } from '@material-ui/core';
import React, { FC } from 'react';
import { MyDeviceCardsList } from '../../containers';
import { Requirements } from '@energyweb/origin-ui-core';
import { useMyDevicePageEffects } from './MyDevicesPage.effects';

export const MyDevicesPage: FC = () => {
  const { myDevices, allDeviceTypes, isLoading, canAccessPage } =
    useMyDevicePageEffects();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Skeleton width={1000} height={140} />
        <Skeleton width={1000} height={140} />
        <Skeleton width={1000} height={140} />
      </div>
    );
  }

  if (!canAccessPage) {
    return <Requirements />;
  }

  return (
    <MyDeviceCardsList allDeviceTypes={allDeviceTypes} devices={myDevices} />
  );
};
