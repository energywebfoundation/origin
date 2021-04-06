import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Default } from './NavSubMenu.stories';

describe('NavSubMenu', () => {
  it('render opened navbar section', () => {
    const { container } = render(
      <BrowserRouter>
        <Default {...Default.args} />
      </BrowserRouter>
    );

    const subMenu = container.querySelector('.MuiCollapse-root');
    expect(subMenu).toBeInTheDocument();

    const subMenuList = subMenu.querySelector('ul');
    expect(subMenuList).toBeInTheDocument();

    const testLink = Default.args.rootUrl + '/' + Default.args.menuList[0].url;
    expect(subMenuList.querySelector('a')).toHaveAttribute('href', testLink);
  });
});
