import React from 'react';
import { render } from '@testing-library/react';

import UiForms from './ui-forms';

describe('UiForms', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiForms />);
    expect(baseElement).toBeTruthy();
  });
});
