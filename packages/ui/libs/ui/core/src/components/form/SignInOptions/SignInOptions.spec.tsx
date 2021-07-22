import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './SignInOptions.stories';
import { BrowserRouter } from 'react-router-dom';

describe('SignInOptions', () => {
  it('should render sign in options', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <Default />
      </BrowserRouter>
    );
    expect(baseElement).toBeInTheDocument();

    expect(baseElement.querySelector('input')).toHaveAttribute(
      'type',
      'checkbox'
    );
    expect(baseElement.querySelector('a')).toHaveAttribute(
      'href',
      '/forgot-password'
    );
  });
});
