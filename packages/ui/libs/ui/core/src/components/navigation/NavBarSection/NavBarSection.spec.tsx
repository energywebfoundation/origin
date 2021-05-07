import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Open, Closed } from './NavBarSection.stories';

describe('NavBarSection', () => {
  it('render opened navbar section', () => {
    const { container } = render(
      <BrowserRouter>
        <Open {...Open.args} />
      </BrowserRouter>
    );

    const sectionHeader = container.querySelector('li');
    expect(sectionHeader.querySelector('a')).toHaveAttribute(
      'href',
      Open.args.rootUrl
    );
    expect(sectionHeader.querySelector('span')).toHaveTextContent(
      Open.args.sectionTitle
    );

    const subMenu = container.querySelector('.MuiCollapse-entered');
    expect(subMenu).toBeInTheDocument();

    const subMenuList = subMenu.querySelector('ul');
    expect(subMenuList).toBeInTheDocument();

    const testLink = Open.args.rootUrl + '/' + Open.args.menuList[0].url;
    expect(subMenuList.querySelector('a')).toHaveAttribute('href', testLink);
  });

  it('render closed navbar section', () => {
    const { container } = render(
      <BrowserRouter>
        <Closed {...Closed.args} />
      </BrowserRouter>
    );

    const sectionHeader = container.querySelector('li');
    expect(sectionHeader.querySelector('a')).toHaveAttribute(
      'href',
      Closed.args.rootUrl
    );
    expect(sectionHeader.querySelector('span')).toHaveTextContent(
      Closed.args.sectionTitle
    );

    const subMenu = container.querySelector('.MuiCollapse-hidden');
    expect(subMenu).toBeInTheDocument();

    const subMenuList = subMenu.querySelector('ul');
    expect(subMenuList).toBeInTheDocument();

    const testLink = Closed.args.rootUrl + '/' + Closed.args.menuList[0].url;
    expect(subMenuList.querySelector('a')).toHaveAttribute('href', testLink);
  });
});
