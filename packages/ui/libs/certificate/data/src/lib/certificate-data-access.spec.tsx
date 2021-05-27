import React from 'react';
import { render } from '@testing-library/react';

import CertificateDataAccess from './certificate-data-access';

describe('CertificateDataAccess', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CertificateDataAccess />);
    expect(baseElement).toBeTruthy();
  });
});
