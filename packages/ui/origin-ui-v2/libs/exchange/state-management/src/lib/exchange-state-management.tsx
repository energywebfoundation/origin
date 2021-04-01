import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface ExchangeStateManagementProps {}

const StyledExchangeStateManagement = styled.div`
  color: pink;
`;

export function ExchangeStateManagement(props: ExchangeStateManagementProps) {
  return (
    <StyledExchangeStateManagement>
      <h1>Welcome to exchange-state-management!</h1>
    </StyledExchangeStateManagement>
  );
}

export default ExchangeStateManagement;
