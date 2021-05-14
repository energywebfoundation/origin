import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface ExchangeDataAccessProps {}

const StyledExchangeDataAccess = styled.div`
  color: pink;
`;

export function ExchangeDataAccess(props: ExchangeDataAccessProps) {
  return (
    <StyledExchangeDataAccess>
      <h1>Welcome to exchange-data-access!</h1>
    </StyledExchangeDataAccess>
  );
}

export default ExchangeDataAccess;
