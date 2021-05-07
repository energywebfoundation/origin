import React from 'react';
import { render } from '@testing-library/react';

import UserLogic from './user-logic';

describe('UserLogic', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserLogic />);
    expect(baseElement).toBeTruthy();
  });
});
