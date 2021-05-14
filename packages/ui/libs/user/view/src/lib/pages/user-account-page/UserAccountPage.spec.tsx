import React from 'react';
import { render } from '@testing-library/react';

import UserAccountPage from './UserAccountPage';

describe('UserAccountPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserAccountPage />);
    expect(baseElement).toBeTruthy();
  });
});
