import React from 'react';
import { render } from '@testing-library/react';

import { AdminClaimsPage } from './AdminClaimsPage';

describe('AdminManageUserClaims', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AdminClaimsPage />);
    expect(baseElement).toBeTruthy();
  });
});
