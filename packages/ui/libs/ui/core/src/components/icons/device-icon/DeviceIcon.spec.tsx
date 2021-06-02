import React from 'react';
import { render } from '@testing-library/react';

import DeviceIcon from './DeviceIcon';

describe('DeviceIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeviceIcon />);
    expect(baseElement).toBeTruthy();
  });
});
