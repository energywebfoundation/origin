import React from 'react';
import { render } from '@testing-library/react';

import AdminManageUsersPage from './AdminManageUsersPage';

describe('AdminManageUsersPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AdminManageUsersPage />);
    expect(baseElement).toBeTruthy();
  });
});
