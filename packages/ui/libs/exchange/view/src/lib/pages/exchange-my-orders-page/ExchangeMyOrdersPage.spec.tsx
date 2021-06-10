import React from 'react';
import { render } from '@testing-library/react';

import ExchangeMyOrdersPage from './ExchangeMyOrdersPage';

describe('ExchangeMyOrdersPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeMyOrdersPage />);
    expect(baseElement).toBeTruthy();
  });
});
