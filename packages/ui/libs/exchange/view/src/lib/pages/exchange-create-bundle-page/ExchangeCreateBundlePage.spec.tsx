import React from 'react';
import { render } from '@testing-library/react';

import ExchangeCreateBundlePage from './ExchangeCreateBundlePage';

describe('ExchangeCreateBundlePage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeCreateBundlePage />);
    expect(baseElement).toBeTruthy();
  });
});
