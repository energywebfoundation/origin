import React from 'react';
import { render } from '@testing-library/react';

import { ProfilePage } from './ProfilePage';

describe('UserAccountPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProfilePage />);
    expect(baseElement).toBeTruthy();
  });
});
