import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface UiCoreProps {}

const StyledUiCore = styled.div`
  color: pink;
`;

export function UiCore(props: UiCoreProps) {
  return (
    <StyledUiCore>
      <h1>Welcome to ui-core!</h1>
    </StyledUiCore>
  );
}

export default UiCore;
