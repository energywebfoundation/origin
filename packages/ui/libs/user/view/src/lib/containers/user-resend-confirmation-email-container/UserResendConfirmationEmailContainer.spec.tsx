import React from 'react';
import { render } from '@testing-library/react';

import UserResendConfirmationEmailContainer from './UserResendConfirmationEmailContainer';

describe('UserResendConfirmationEmailContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserResendConfirmationEmailContainer />);
    expect(baseElement).toBeTruthy();
  });
});
