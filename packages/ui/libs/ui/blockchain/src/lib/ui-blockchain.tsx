import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface UiBlockchainProps {}

const StyledUiBlockchain = styled.div`
  color: pink;
`;

export function UiBlockchain(props: UiBlockchainProps) {
  return (
    <StyledUiBlockchain>
      <h1>Welcome to ui-blockchain!</h1>
    </StyledUiBlockchain>
  );
}

export default UiBlockchain;
