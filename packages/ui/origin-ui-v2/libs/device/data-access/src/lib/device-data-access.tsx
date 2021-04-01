import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface DeviceDataAccessProps {}

const StyledDeviceDataAccess = styled.div`
  color: pink;
`;

export function DeviceDataAccess(props: DeviceDataAccessProps) {
  return (
    <StyledDeviceDataAccess>
      <h1>Welcome to device-data-access!</h1>
    </StyledDeviceDataAccess>
  );
}

export default DeviceDataAccess;
