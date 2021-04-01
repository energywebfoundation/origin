import React from 'react';
import { render } from '@testing-library/react';

import DeviceView from './device-view';

describe('DeviceView', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DeviceView />);
    expect(baseElement).toBeTruthy();
  });
});
