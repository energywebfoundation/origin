import React from 'react';
import { composeStories } from '@storybook/testing-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import * as stories from '../../components/navigation/NavSubMenu/NavSubMenu.stories';
import { NavSubMenuProps } from '../../components/navigation/NavSubMenu/NavSubMenu';

const { Default } = composeStories(stories);

describe('NavSubMenu', () => {
  it('should render default NavSubMenu', () => {
    const { baseElement, getByText } = render(
      <Default {...(Default.args as NavSubMenuProps)} />
    );
    expect(baseElement).toBeInTheDocument();
    expect(baseElement.querySelectorAll('.MuiListItem-root')).toHaveLength(
      Default.args.menuList.length
    );
    expect(getByText(Default.args.menuList[0].label)).toBeInTheDocument();
    expect(getByText(Default.args.menuList[1].label)).toBeInTheDocument();

    expect(baseElement.querySelectorAll('.MuiButton-root')[0]).toHaveAttribute(
      'href',
      `${Default.args.rootUrl}/${Default.args.menuList[0].url}`
    );
    expect(baseElement.querySelectorAll('.MuiButton-root')[1]).toHaveAttribute(
      'href',
      `${Default.args.rootUrl}/${Default.args.menuList[1].url}`
    );
  });
});
