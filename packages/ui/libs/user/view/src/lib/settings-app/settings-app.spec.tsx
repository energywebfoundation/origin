import React from 'react';
import { render } from '@testing-library/react';

import SettingsApp from './settings-app';
import { BrowserRouter, Routes } from 'react-router-dom';

describe('SettingsApp', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <Routes basename={'//*'}>
          <SettingsApp />
        </Routes>
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });
});
