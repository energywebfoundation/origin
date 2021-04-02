import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface DeviceStateManagementProps {}

const StyledDeviceStateManagement = styled.div`
  color: pink;
`;

export function DeviceStateManagement(props: DeviceStateManagementProps) {
  return (
    <StyledDeviceStateManagement>
      <h1>Welcome to device-state-management!</h1>
    </StyledDeviceStateManagement>
  );
}

export default DeviceStateManagement;
