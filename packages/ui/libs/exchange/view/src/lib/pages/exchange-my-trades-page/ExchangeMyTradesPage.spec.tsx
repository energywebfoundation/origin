import React from 'react';
import { render } from '@testing-library/react';

import ExchangeMyTradesPage from './ExchangeMyTradesPage';

describe('ExchangeMyTradesPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeMyTradesPage />);
    expect(baseElement).toBeTruthy();
  });
});
