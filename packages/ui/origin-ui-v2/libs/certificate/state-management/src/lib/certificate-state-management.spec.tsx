import React from 'react';
import { render } from '@testing-library/react';

import CertificateStateManagement from './certificate-state-management';

describe('CertificateStateManagement', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CertificateStateManagement />);
    expect(baseElement).toBeTruthy();
  });
});
