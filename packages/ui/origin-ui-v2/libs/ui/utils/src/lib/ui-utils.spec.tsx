import React from 'react';
import { render } from '@testing-library/react';

import UiUtils from './ui-utils';

describe('UiUtils', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiUtils />);
    expect(baseElement).toBeTruthy();
  });
});
