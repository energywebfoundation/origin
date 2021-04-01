import React from 'react';
import { render } from '@testing-library/react';

import UiFormatters from './ui-formatters';

describe('UiFormatters', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiFormatters />);
    expect(baseElement).toBeTruthy();
  });
});
