import React from 'react';
import { render } from '@testing-library/react';

import ExchangeMyOrdersOpenBidsTable from './ExchangeMyOrdersOpenBidsTable';

describe('ExchangeMyOrdersOpenBidsTable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ExchangeMyOrdersOpenBidsTable loading={false} data={[]} />
    );
    expect(baseElement).toBeTruthy();
  });
});
