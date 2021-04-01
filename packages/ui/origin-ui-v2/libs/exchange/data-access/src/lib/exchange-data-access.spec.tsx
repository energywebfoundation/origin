import React from 'react';
import { render } from '@testing-library/react';

import ExchangeDataAccess from './exchange-data-access';

describe('ExchangeDataAccess', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeDataAccess />);
    expect(baseElement).toBeTruthy();
  });
});
