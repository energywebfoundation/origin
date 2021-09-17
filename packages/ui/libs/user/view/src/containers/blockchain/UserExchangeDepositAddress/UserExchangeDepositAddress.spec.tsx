import React from 'react';
import { render } from '@testing-library/react';

import UserExchangeDepositAddressContainer from './UserExchangeDepositAddressContainer';

describe('UserExchangeDepositAddress', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <UserExchangeDepositAddressContainer loading={false} />
    );
    expect(baseElement).toBeTruthy();
  });
});
