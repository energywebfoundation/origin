import React from 'react';
import { Meta } from '@storybook/react';
import { DesktopNav, DesktopNavProps } from './DesktopNav';

export default {
  title: 'Navigation / DesktopNav',
  component: DesktopNav,
} as Meta;

export const Default = (args: DesktopNavProps) => <DesktopNav {...args} />;

const userAndOrgData = {
  username: 'John Doe',
  userPending: true,
  userTooltip: 'Pending user status message',
  orgName: 'Lorem ipsum organization',
  orgPending: true,
  orgTooltip: 'Pending organization status message',
};

const section1MenuList = [
  {
    url: 'menu_item_one',
    label: 'Item one',
    component: <div>Item one</div>,
    show: true,
  },
  {
    url: 'menu_item_two',
    label: 'Item two',
    component: <div>Item one</div>,
    show: true,
  },
];
const section2MenuList = [
  {
    url: 'menu_item_one',
    label: 'Item one',
    component: <div>Item one</div>,
    show: true,
  },
  {
    url: 'menu_item_two',
    label: 'Item two',
    component: <div>Item one</div>,
    show: true,
  },
];

const menuSections = [
  {
    sectionTitle: 'Section 1 title',
    show: true,
    rootUrl: '/section-1-link',
    isOpen: true,
    menuList: section1MenuList,
  },
  {
    sectionTitle: 'Section 2 title',
    show: true,
    rootUrl: '/section-2-link',
    isOpen: false,
    menuList: section2MenuList,
  },
];

Default.args = {
  userAndOrgData,
  menuSections,
};
