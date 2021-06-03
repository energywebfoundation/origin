import React from 'react';
import { render } from '@testing-library/react';

import UserBlockchainAddressesContainer from './UserBlockchainAddressesContainer';
import { IUser, KYCStatus, UserStatus } from '@energyweb/origin-backend-core';

const userMock: IUser = {
  id: 123,
  title: 'Mr',
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser@mail.com',
  telephone: '111-111-111',
  blockchainAccountAddress: '0x111111111111111f123',
  blockchainAccountSignedMessage: '0x11111112233abc',
  notifications: true,
  rights: 1,
  status: UserStatus.Active,
  kycStatus: KYCStatus.Passed,
  organization: null,
  emailConfirmed: false,
};

describe('UserBlockchainAddressesContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <UserBlockchainAddressesContainer user={userMock} />
    );
    expect(baseElement).toBeTruthy();
  });
});
