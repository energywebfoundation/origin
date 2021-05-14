import React from 'react';
import { render } from '@testing-library/react';

import AppContainer from './AppContainer';
import { MemoryRouter } from 'react-router';

describe('AppContainer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <AppContainer />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
  });
});
