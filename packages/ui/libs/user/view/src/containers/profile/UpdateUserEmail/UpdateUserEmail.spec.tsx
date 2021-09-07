import React from 'react';
import { render } from '@testing-library/react';

import { UpdateUserEmail } from './UpdateUserEmail';

describe('UpdateUserEmail', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpdateUserEmail userAccountData={null} />);
    expect(baseElement).toBeTruthy();
  });
});
