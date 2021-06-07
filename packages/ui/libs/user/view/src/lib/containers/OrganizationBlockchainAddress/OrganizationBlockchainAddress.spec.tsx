import React from 'react';
import { render } from '@testing-library/react';

import { OrganizationBlockchainAddress } from './OrganizationBlockchainAddress';

describe('UserBlockchainAddress', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <OrganizationBlockchainAddress userAccountData={null} />
    );
    expect(baseElement).toBeTruthy();
  });
});
