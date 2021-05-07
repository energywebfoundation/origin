import React from 'react';
import { render } from '@testing-library/react';

import CertificateView from './certificate-view';

describe('CertificateView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CertificateView />);
    expect(baseElement).toBeTruthy();
  });
});
