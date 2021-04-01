import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface CertificateViewProps {}

const StyledCertificateView = styled.div`
  color: pink;
`;

export function CertificateView(props: CertificateViewProps) {
  return (
    <StyledCertificateView>
      <h1>Welcome to certificate-view!</h1>
    </StyledCertificateView>
  );
}

export default CertificateView;
