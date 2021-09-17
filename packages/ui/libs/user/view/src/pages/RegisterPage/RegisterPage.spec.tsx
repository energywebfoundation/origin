import React from 'react';
import { render } from '@testing-library/react';

import { RegisterPage } from './RegisterPage';

describe('RegisterPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RegisterPage />);
    expect(baseElement).toBeTruthy();
  });
});
