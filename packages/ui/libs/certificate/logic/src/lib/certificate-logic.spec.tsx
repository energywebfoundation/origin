import React from 'react';
import { render } from '@testing-library/react';

import CertificateLogic from './certificate-logic';

describe('CertificateLogic', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CertificateLogic />);
    expect(baseElement).toBeTruthy();
  });
});
