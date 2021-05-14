import React from 'react';
import { render } from '@testing-library/react';

import SignInPage from './SignInPage';
import { AuthProvider } from '@energy-web/origin-ui-api-clients';

describe('SignInPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <AuthProvider>
        <SignInPage />
      </AuthProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
