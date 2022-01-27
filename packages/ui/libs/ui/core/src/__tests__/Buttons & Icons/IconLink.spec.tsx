import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/icons/IconLink/IconLink.stories';
import { IconLinkProps } from '../../components/icons/IconLink/IconLink';

const { Default } = composeStories(stories);

describe('IconLink', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Default {...(Default.args as IconLinkProps)} />
    );

    expect(baseElement).toBeInTheDocument();
  });

  it('renders check icon with default url', () => {
    const { container } = render(
      <Default {...(Default.args as IconLinkProps)} />
    );
    expect(container.querySelector('a').getAttribute('href')).toBe(
      Default.args.url
    );
  });
});
