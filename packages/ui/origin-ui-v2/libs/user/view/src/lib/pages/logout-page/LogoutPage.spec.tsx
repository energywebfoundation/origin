import React from 'react';
import { render } from '@testing-library/react';

import LogoutPage from './LogoutPage';
import { AuthProvider } from '@energy-web/origin-ui-api-clients';

describe('LogoutPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <AuthProvider>
        <LogoutPage />
      </AuthProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
