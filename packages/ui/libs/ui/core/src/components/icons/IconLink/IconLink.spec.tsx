import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CheckIcon } from './IconLink.stories';
import { BrowserRouter } from 'react-router-dom';

describe('IconLink', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <CheckIcon {...CheckIcon.args} />
      </BrowserRouter>
    );

    expect(baseElement).toBeInTheDocument();
  });

  it('renders check icon with default url', () => {
    const { getByRole, container } = render(
      <BrowserRouter>
        <CheckIcon {...CheckIcon.args} />
      </BrowserRouter>
    );
    expect(container.querySelector('a').getAttribute('href')).toBe(
      CheckIcon.args.url
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
