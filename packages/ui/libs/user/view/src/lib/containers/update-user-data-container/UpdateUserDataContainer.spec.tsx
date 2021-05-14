import React from 'react';
import { render } from '@testing-library/react';

import UpdateUserDataContainer from './UpdateUserDataContainer';

describe('UpdateUserDataContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UpdateUserDataContainer />);
    expect(baseElement).toBeTruthy();
  });
});
