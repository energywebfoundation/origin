import React from 'react';
import { render } from '@testing-library/react';

import DeviceStateManagement from './device-state-management';

describe('DeviceStateManagement', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeviceStateManagement />);
    expect(baseElement).toBeTruthy();
  });
});
