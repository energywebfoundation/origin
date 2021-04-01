import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface ExchangeViewProps {}

const StyledExchangeView = styled.div`
  color: pink;
`;

export function ExchangeView(props: ExchangeViewProps) {
  return (
    <StyledExchangeView>
      <h1>Welcome to exchange-view!</h1>
    </StyledExchangeView>
  );
}

export default ExchangeView;
