import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface ExchangeCreateBundlePageProps {}

const StyledExchangeCreateBundlePage = styled.div`
  color: pink;
`;

export function ExchangeCreateBundlePage(props: ExchangeCreateBundlePageProps) {
  return (
    <StyledExchangeCreateBundlePage>
      <h1>Welcome to ExchangeCreateBundlePage!</h1>
    </StyledExchangeCreateBundlePage>
  );
}

export default ExchangeCreateBundlePage;
