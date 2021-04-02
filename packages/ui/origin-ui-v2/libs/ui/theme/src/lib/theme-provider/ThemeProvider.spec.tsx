import React from 'react';
import { render } from '@testing-library/react';

import ThemeProvider from './ThemeProvider';

describe('ThemeProvider', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ThemeProvider children={null} />);
    expect(baseElement).toBeTruthy();
  });
});
