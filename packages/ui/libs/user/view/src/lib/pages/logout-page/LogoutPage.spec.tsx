import React from 'react';
import { render } from '@testing-library/react';

import LogoutPage from './LogoutPage';
import { AuthProvider } from '@energyweb/origin-ui-react-query-providers';

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
