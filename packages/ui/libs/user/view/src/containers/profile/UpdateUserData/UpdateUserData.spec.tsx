import React from 'react';
import { render } from '@testing-library/react';

import { UpdateUserData } from './UpdateUserData';

describe('UpdateUserDataContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpdateUserData userAccountData={null} />);
    expect(baseElement).toBeTruthy();
  });
});
