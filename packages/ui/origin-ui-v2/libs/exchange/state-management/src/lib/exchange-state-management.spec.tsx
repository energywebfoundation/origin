import React from 'react';
import { render } from '@testing-library/react';

import ExchangeStateManagement from './exchange-state-management';

describe('ExchangeStateManagement', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeStateManagement />);
    expect(baseElement).toBeTruthy();
  });
});
