import React from 'react';
import { render } from '@testing-library/react';

import ExchangeView from './exchange-view';

describe('ExchangeView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeView />);
    expect(baseElement).toBeTruthy();
  });
});
