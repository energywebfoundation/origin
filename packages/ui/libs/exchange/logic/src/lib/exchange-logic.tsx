import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface ExchangeLogicProps {}

const StyledExchangeLogic = styled.div`
  color: pink;
`;

export function ExchangeLogic(props: ExchangeLogicProps) {
  return (
    <StyledExchangeLogic>
      <h1>Welcome to exchange-logic!</h1>
    </StyledExchangeLogic>
  );
}

export default ExchangeLogic;
