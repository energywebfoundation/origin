import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/navigation/NavSectionTitle/NavSectionTitle.stories';
import { NavSectionTitleProps } from '../../components/navigation/NavSectionTitle/NavSectionTitle';

const { Default } = composeStories(stories);

describe('NavSectionTitle', () => {
  it('should render default NavSectionTitle', () => {
    const { baseElement } = render(
      <Default {...(Default.args as NavSectionTitleProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelector('a')).toBeInTheDocument();
    expect(baseElement.querySelector('a')).toHaveAttribute(
      'href',
      Default.args.url
    );
    expect(baseElement.querySelector('a')).toHaveTextContent(
      Default.args.title
    );
  });
});
