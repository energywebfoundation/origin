import React from 'react';
import { render } from '@testing-library/react';

import { AuthApp } from './AuthApp';
import { BrowserRouter, Routes } from 'react-router-dom';

describe('AuthApp', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <Routes basename={'//*'}>
          <AuthApp />
        </Routes>
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });
});
