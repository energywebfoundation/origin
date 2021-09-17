import React from 'react';
import { render } from '@testing-library/react';

import { BlockchainAddressesContainer } from './BlockchainAddressesContainer';

describe('UserBlockchainAddressesContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BlockchainAddressesContainer />);
    expect(baseElement).toBeTruthy();
  });
});
