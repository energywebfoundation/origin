import React from 'react';
import { render } from '@testing-library/react';

import UserBlockchainAddressesContainer from './BlockchainAddressesContainer';

describe('UserBlockchainAddressesContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserBlockchainAddressesContainer />);
    expect(baseElement).toBeTruthy();
  });
});
