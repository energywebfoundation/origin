import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface UiLocalizationProps {}

const StyledUiLocalization = styled.div`
  color: pink;
`;

export function UiLocalization(props: UiLocalizationProps) {
  return (
    <StyledUiLocalization>
      <h1>Welcome to ui-localization!</h1>
    </StyledUiLocalization>
  );
}

export default UiLocalization;
