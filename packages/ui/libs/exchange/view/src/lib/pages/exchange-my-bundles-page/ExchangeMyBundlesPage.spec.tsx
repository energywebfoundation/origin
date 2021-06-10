import React from 'react';
import { render } from '@testing-library/react';

import ExchangeMyBundlesPage from './ExchangeMyBundlesPage';

describe('ExchangeMyBundlesPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeMyBundlesPage />);
    expect(baseElement).toBeTruthy();
  });
});
