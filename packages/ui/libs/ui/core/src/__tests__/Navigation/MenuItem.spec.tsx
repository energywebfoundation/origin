import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/navigation/MenuItem/MenuItem.stories';
import { MenuItemProps } from '../../components/navigation/MenuItem/MenuItem';

const { Default } = composeStories(stories);

describe('MenuItem', () => {
  it('render menu item', () => {
    const { container } = render(
      <Default {...(Default.args as MenuItemProps)} />
    );
    const listItem = container.querySelector('li');
    expect(listItem).toBeInTheDocument();

    const link = listItem.querySelector('a');
    expect(link).toHaveAttribute('href', Default.args.url);
  });
});
