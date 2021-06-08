import React from 'react';
import { render } from '@testing-library/react';

import RegisterPage from './RegisterPage';
import { AuthProvider } from '@energyweb/origin-ui-react-query-providers';

describe('RegisterPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
