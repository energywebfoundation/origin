import React from 'react';
import { Meta } from '@storybook/react';
import { NavSubMenu, NavSubMenuProps } from './NavSubMenu';

export default {
  title: 'Navigation / NavSubMenu',
  component: NavSubMenu,
} as Meta;

export const Default = (args: NavSubMenuProps) => <NavSubMenu {...args} />;

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

Default.args = {
  open: true,
  rootUrl: '/section-one',
  menuList: section1MenuList,
};
