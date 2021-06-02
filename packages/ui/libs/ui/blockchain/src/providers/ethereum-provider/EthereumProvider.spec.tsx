import React from 'react';
import { render } from '@testing-library/react';

import EthereumProvider from './BlockchainProvider';

describe('EthereumProvider', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EthereumProvider />);
    expect(baseElement).toBeTruthy();
  });
});
