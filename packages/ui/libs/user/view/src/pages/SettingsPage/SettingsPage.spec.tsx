import React from 'react';
import { render } from '@testing-library/react';

import { SettingsPage } from './SettingsPage';

describe('SettingsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SettingsPage />);
    expect(baseElement).toBeTruthy();
  });
});
