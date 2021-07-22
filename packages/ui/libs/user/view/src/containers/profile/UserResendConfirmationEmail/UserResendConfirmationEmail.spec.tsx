import React from 'react';
import { render } from '@testing-library/react';

import { UserResendConfirmationEmail } from './UserResendConfirmationEmail';

describe('UserResendConfirmationEmailContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserResendConfirmationEmail />);
    expect(baseElement).toBeTruthy();
  });
});
