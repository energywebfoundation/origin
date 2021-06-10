import React from 'react';
import { render } from '@testing-library/react';

import ExchangeMyOrdersDemandsTable from './ExchangeMyOrdersDemandsTable';

describe('ExchangeMyOrdersDemandsTable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeMyOrdersDemandsTable />);
    expect(baseElement).toBeTruthy();
  });
});
