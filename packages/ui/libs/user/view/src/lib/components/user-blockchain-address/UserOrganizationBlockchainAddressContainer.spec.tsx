import React from 'react';
import { render } from '@testing-library/react';

import UserOrganizationBlockchainAccountAddressContainer from './UserOrganizationBlockchainAccountAddressContainer';

describe('UserBlockchainAddress', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <UserOrganizationBlockchainAccountAddressContainer />
    );
    expect(baseElement).toBeTruthy();
  });
});
