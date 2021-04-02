import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface DeviceLogicProps {}

const StyledDeviceLogic = styled.div`
  color: pink;
`;

export function DeviceLogic(props: DeviceLogicProps) {
  return (
    <StyledDeviceLogic>
      <h1>Welcome to device-logic!</h1>
    </StyledDeviceLogic>
  );
}

export default DeviceLogic;
