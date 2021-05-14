import React from 'react';
import { render } from '@testing-library/react';

import UserSettingsPage from './UserSettingsPage';

describe('UserSettingsPage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UserSettingsPage />);
    expect(baseElement).toBeTruthy();
  });
});
