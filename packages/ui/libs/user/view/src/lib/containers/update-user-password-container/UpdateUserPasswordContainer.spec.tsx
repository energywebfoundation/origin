import React from 'react';
import { render } from '@testing-library/react';

import UpdateUserPasswordContainer from './UpdateUserPasswordContainer';

describe('UpdateUserPasswordContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpdateUserPasswordContainer />);
    expect(baseElement).toBeTruthy();
  });
});
