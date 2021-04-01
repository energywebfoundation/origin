import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface UiUtilsProps {}

const StyledUiUtils = styled.div`
  color: pink;
`;

export function UiUtils(props: UiUtilsProps) {
  return (
    <StyledUiUtils>
      <h1>Welcome to ui-utils!</h1>
    </StyledUiUtils>
  );
}

export default UiUtils;
