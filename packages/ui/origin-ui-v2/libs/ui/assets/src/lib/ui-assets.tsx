import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface UiAssetsProps {}

const StyledUiAssets = styled.div`
  color: pink;
`;

export function UiAssets(props: UiAssetsProps) {
  return (
    <StyledUiAssets>
      <h1>Welcome to ui-assets!</h1>
    </StyledUiAssets>
  );
}

export default UiAssets;
