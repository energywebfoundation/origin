import React from 'react';
import { render } from '@testing-library/react';

import AdminUpdateUserPage from './AdminUpdateUserPage';
import { userMock } from '../../__mocks__/userMock';

describe('AdminUpdateUserPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <AdminUpdateUserPage userId={userMock.id} userData={userMock} />
    );
    expect(baseElement).toBeTruthy();
  });
});
