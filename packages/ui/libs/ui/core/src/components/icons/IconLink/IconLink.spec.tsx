import React from 'react';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

import { Default } from './IconLink.stories';
import { IconLinkProps } from './IconLink';

describe('IconLink', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BrowserRouter>
        <Default {...(Default.args as IconLinkProps)} />
      </BrowserRouter>
    );

    expect(baseElement).toBeInTheDocument();
  });

  it('renders check icon with default url', () => {
    const { container } = render(
      <BrowserRouter>
        <Default {...(Default.args as IconLinkProps)} />
      </BrowserRouter>
    );
    expect(container.querySelector('a').getAttribute('href')).toBe(
      Default.args.url
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
