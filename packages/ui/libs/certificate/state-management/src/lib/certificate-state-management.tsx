import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface CertificateStateManagementProps {}

const StyledCertificateStateManagement = styled.div`
  color: pink;
`;

export function CertificateStateManagement(
  props: CertificateStateManagementProps
) {
  return (
    <StyledCertificateStateManagement>
      <h1>Welcome to certificate-state-management!</h1>
    </StyledCertificateStateManagement>
  );
}

export default CertificateStateManagement;
