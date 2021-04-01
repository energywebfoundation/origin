import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface DeviceViewProps {}

const StyledDeviceView = styled.div`
  color: pink;
`;

export function DeviceView(props: DeviceViewProps) {
  return (
    <StyledDeviceView>
      <h1>Welcome to device-view!</h1>
    </StyledDeviceView>
  );
}

export default DeviceView;
