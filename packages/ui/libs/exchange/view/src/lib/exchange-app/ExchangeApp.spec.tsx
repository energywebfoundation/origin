import React from 'react';
import { render } from '@testing-library/react';

import ExchangeApp from './ExchangeApp';

describe('ExchangeApp', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeApp />);
    expect(baseElement).toBeTruthy();
  });
});
