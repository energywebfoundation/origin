import { TableComponent } from '@energyweb/origin-ui-core';
import { pendingDevicesMock } from '../../__mocks__/pendingDevices';
import React, { FC } from 'react';

export const PendingPage: FC = () => {
  return <TableComponent {...pendingDevicesMock} />;
};
