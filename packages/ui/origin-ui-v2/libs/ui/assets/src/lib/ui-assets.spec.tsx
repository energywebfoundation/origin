import React from 'react';
import { render } from '@testing-library/react';

import UiAssets from './ui-assets';

describe('UiAssets', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiAssets />);
    expect(baseElement).toBeTruthy();
  });
});
