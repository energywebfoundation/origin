import React from 'react';
import { render } from '@testing-library/react';

import UiTheme from './ui-theme';

describe('UiTheme', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiTheme />);
    expect(baseElement).toBeTruthy();
  });
});
