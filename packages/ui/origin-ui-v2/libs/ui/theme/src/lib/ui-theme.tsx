import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface UiThemeProps {}

const StyledUiTheme = styled.div`
  color: pink;
`;

export function UiTheme(props: UiThemeProps) {
  return (
    <StyledUiTheme>
      <h1>Welcome to ui-theme!</h1>
    </StyledUiTheme>
  );
}

export default UiTheme;
