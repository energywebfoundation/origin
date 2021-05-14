import React from 'react';
import { render } from '@testing-library/react';

import UserBlochainAdressesContainer from './UserBlochainAdressesContainer';

describe('UserBlochainAdressesContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserBlochainAdressesContainer />);
    expect(baseElement).toBeTruthy();
  });
});
