import React from 'react';
import { render } from '@testing-library/react';

import ExchangeViewMarketPage from './ExchangeViewMarketPage';

describe('ExchangeViewMarketPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeViewMarketPage />);
    expect(baseElement).toBeTruthy();
  });
});
