import React from 'react';
import { render } from '@testing-library/react';

import UiLocalization from './ui-localization';

describe('UiLocalization', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiLocalization />);
    expect(baseElement).toBeTruthy();
  });
});
