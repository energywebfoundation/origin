import React from 'react';
import { render } from '@testing-library/react';

import { AdminUsersPage } from './AdminUsersPage';

describe('AdminManageUsersPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AdminUsersPage />);
    expect(baseElement).toBeTruthy();
  });
});
