import React from 'react';
import { render } from '@testing-library/react';

import UserDataAccess from './user-data-access';

describe('UserDataAccess', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserDataAccess />);
    expect(baseElement).toBeTruthy();
  });
});
