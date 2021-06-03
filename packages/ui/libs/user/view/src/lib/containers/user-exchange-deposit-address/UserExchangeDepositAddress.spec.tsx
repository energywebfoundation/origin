import React from 'react';
import { render } from '@testing-library/react';

import UserExchangeDepositAddressContainer from './UserExchangeDepositAddressContainer';

describe('UserExchangeDepositAddress', () => {
  const handleCreateExchangeDepositAddressMockFn = jest.fn();
  it('should render successfully', () => {
    beforeEach((cb) => {});
    const { baseElement } = render(
      <UserExchangeDepositAddressContainer loading={false} />
    );
    expect(baseElement).toBeTruthy();
  });
});
