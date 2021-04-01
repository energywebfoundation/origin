import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface UiFormattersProps {}

const StyledUiFormatters = styled.div`
  color: pink;
`;

export function UiFormatters(props: UiFormattersProps) {
  return (
    <StyledUiFormatters>
      <h1>Welcome to ui-formatters!</h1>
    </StyledUiFormatters>
  );
}

export default UiFormatters;
