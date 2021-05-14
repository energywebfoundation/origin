import React from 'react';
import { render } from '@testing-library/react';

import App from './app';
import { MemoryRouter } from 'react-router';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(baseElement).toBeTruthy();
  });
});
