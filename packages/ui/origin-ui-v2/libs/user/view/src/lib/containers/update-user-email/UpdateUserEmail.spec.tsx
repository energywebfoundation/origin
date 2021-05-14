import React from 'react';
import { render } from '@testing-library/react';

import UpdateUserEmailContainer from './UpdateUserEmailContainer';

describe('UpdateUserEmail', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpdateUserEmailContainer />);
    expect(baseElement).toBeTruthy();
  });
});
