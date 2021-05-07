import React from 'react';
import { render } from '@testing-library/react';

import UserStateManagement from './user-state-management';

describe('UserStateManagement', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserStateManagement />);
    expect(baseElement).toBeTruthy();
  });
});
