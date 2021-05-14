import React from 'react';
import { render } from '@testing-library/react';

import AdminApp from './admin-app';
import { BrowserRouter, Routes } from 'react-router-dom';

describe('AdminApp', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <Routes basename={'//*'}>
          <AdminApp />
        </Routes>
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });
});
