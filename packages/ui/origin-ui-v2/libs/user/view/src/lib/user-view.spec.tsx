import React from 'react';
import { render } from '@testing-library/react';

import UserView from './user-view';

describe('UserView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserView />);
    expect(baseElement).toBeTruthy();
  });
});
