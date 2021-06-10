import React from 'react';
import { render } from '@testing-library/react';

import ExchangeAssertUserCanTrade from './ExchangeAssertUserCanTrade';

describe('ExchangeAssertUserCanTrade', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeAssertUserCanTrade />);
    expect(baseElement).toBeTruthy();
  });
});
