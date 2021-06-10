import React from 'react';
import { render } from '@testing-library/react';

import ExchangeBundlesPage from './ExchangeBundlesPage';

describe('ExchangeBundlesPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExchangeBundlesPage />);
    expect(baseElement).toBeTruthy();
  });
});
