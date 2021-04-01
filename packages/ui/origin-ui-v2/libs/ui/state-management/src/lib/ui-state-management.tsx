import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface UiStateManagementProps {}

const StyledUiStateManagement = styled.div`
  color: pink;
`;

export function UiStateManagement(props: UiStateManagementProps) {
  return (
    <StyledUiStateManagement>
      <h1>Welcome to ui-state-management!</h1>
    </StyledUiStateManagement>
  );
}

export default UiStateManagement;
