import React from 'react';
import { render } from '@testing-library/react';

import { OriginThemeProvider } from './OriginThemeProvider';

describe('ThemeProvider', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OriginThemeProvider children={null} />);
    expect(baseElement).toBeTruthy();
  });
});
