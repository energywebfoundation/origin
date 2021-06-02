import React from 'react';
import { render } from '@testing-library/react';

import UiBlockchain from './ui-blockchain';

describe('UiBlockchain', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiBlockchain />);
    expect(baseElement).toBeTruthy();
  });
});
