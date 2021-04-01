import React from 'react';
import { render } from '@testing-library/react';

import DeviceLogic from './device-logic';

describe('DeviceLogic', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeviceLogic />);
    expect(baseElement).toBeTruthy();
  });
});
