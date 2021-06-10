import React from 'react';
import { render } from '@testing-library/react';

import ExchangeMyOrdersOpenAsksTable from './ExchangeMyOrdersOpenAsksTable';

describe('ExchangeMyOrdersOpenAsksTable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeMyOrdersOpenAsksTable />);
    expect(baseElement).toBeTruthy();
  });
});
