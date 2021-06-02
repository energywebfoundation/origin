import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface DeviceIconProps {}

const StyledDeviceIcon = styled.div`
  color: pink;
`;

export function DeviceIcon(props: DeviceIconProps) {
  return (
    <StyledDeviceIcon>
      <h1>Welcome to DeviceIcon!</h1>
    </StyledDeviceIcon>
  );
}

export default DeviceIcon;
