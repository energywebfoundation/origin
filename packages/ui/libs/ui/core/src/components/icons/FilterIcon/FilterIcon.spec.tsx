import React from 'react';
import { render } from '@testing-library/react';

import FilterIcon from './FilterIcon';

describe('FilterIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FilterIcon />);
    expect(baseElement).toBeTruthy();
  });
});
