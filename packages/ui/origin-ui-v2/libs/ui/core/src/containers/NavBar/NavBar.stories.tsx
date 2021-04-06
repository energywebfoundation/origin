import React from 'react';
import { Meta } from '@storybook/react';
import { NavBar, NavBarProps } from './NavBar';

export default {
  title: 'Containers / NavBar',
  component: NavBar,
} as Meta;

export const Default = (args: NavBarProps) => <NavBar {...args} />;
const userData = {
  username: 'John Doe',
  userPending: true,
  userTooltip: 'Pending user status message',
};
const orgData = {
  orgName: 'Lorem ipsum organization',
  orgPending: true,
  orgTooltip: 'Pending organization status message',
};
const section1MenuList = [
  {
    key: 'menu_item_one',
    label: 'Item one',
    component: <div>Item one</div>,
    show: true,
  },
  {
    key: 'menu_item_two',
    label: 'Item two',
    component: <div>Item one</div>,
    show: true,
  },
];
const section2MenuList = [
  {
    key: 'menu_item_one',
    label: 'Item one',
    component: <div>Item one</div>,
    show: true,
  },
  {
    key: 'menu_item_two',
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
  userData,
  orgData,
  menuSections,
  openMobile: true,
};
