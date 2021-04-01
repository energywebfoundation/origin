import React from 'react';
import { render } from '@testing-library/react';

import DeviceDataAccess from './device-data-access';

describe('DeviceDataAccess', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeviceDataAccess />);
    expect(baseElement).toBeTruthy();
  });
});
