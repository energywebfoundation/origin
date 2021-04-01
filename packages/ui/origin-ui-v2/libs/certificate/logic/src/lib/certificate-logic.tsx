import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface CertificateLogicProps {}

const StyledCertificateLogic = styled.div`
  color: pink;
`;

export function CertificateLogic(props: CertificateLogicProps) {
  return (
    <StyledCertificateLogic>
      <h1>Welcome to certificate-logic!</h1>
    </StyledCertificateLogic>
  );
}

export default CertificateLogic;
