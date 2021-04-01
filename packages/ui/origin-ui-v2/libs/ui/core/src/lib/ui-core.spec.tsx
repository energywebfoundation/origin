import React from 'react';
import { render } from '@testing-library/react';

import UiCore from './ui-core';

describe('UiCore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiCore />);
    expect(baseElement).toBeTruthy();
  });
});
