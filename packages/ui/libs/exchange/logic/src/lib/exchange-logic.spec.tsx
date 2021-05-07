import React from 'react';
import { render } from '@testing-library/react';

import ExchangeLogic from './exchange-logic';

describe('ExchangeLogic', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeLogic />);
    expect(baseElement).toBeTruthy();
  });
});
