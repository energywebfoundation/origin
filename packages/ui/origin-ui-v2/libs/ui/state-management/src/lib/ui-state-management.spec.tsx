import React from 'react';
import { render } from '@testing-library/react';

import UiStateManagement from './ui-state-management';

describe('UiStateManagement', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiStateManagement />);
    expect(baseElement).toBeTruthy();
  });
});
