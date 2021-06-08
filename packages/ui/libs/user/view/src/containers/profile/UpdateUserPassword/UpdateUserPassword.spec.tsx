import React from 'react';
import { render } from '@testing-library/react';

import { UpdateUserPassword } from './UpdateUserPassword';

describe('UpdateUserPasswordContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpdateUserPassword />);
    expect(baseElement).toBeTruthy();
  });
});
