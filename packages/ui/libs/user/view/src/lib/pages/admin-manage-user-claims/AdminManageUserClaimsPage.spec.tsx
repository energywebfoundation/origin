import React from 'react';
import { render } from '@testing-library/react';

import AdminManageUserClaimsPage from './AdminManageUserClaimsPage';

describe('AdminManageUserClaims', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AdminManageUserClaimsPage />);
    expect(baseElement).toBeTruthy();
  });
});
