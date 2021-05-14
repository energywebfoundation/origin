import React from 'react';
import { render } from '@testing-library/react';

import ResetPasswordPage from './ResetPasswordPage';

describe('ResetPasswordPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ResetPasswordPage />);
    expect(baseElement).toBeTruthy();
  });
});
