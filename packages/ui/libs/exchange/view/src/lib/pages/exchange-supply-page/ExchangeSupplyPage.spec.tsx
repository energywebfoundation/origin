import React from 'react';
import { render } from '@testing-library/react';

import ExchangeSupplyPage from './ExchangeSupplyPage';

describe('ExchangeSupplyPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeSupplyPage />);
    expect(baseElement).toBeTruthy();
  });
});
