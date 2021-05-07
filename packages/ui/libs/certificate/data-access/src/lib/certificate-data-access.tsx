import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface CertificateDataAccessProps {}

const StyledCertificateDataAccess = styled.div`
  color: pink;
`;

export function CertificateDataAccess(props: CertificateDataAccessProps) {
  return (
    <StyledCertificateDataAccess>
      <h1>Welcome to certificate-data-access!</h1>
    </StyledCertificateDataAccess>
  );
}

export default CertificateDataAccess;
