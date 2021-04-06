import React from 'react';
import { Meta } from '@storybook/react';
import { NavBarSection, NavBarSectionProps } from './NavBarSection';

export default {
  title: 'Navigation / NavBarSection',
  component: NavBarSection,
} as Meta;

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
const openedSection = {
  sectionTitle: 'Opened section title',
  show: true,
  rootUrl: '/opened',
  isOpen: true,
  menuList: section1MenuList,
};
const closedSection = {
  sectionTitle: 'Closed section title',
  show: true,
  rootUrl: '/closed',
  isOpen: false,
  menuList: section2MenuList,
};

export const Open = (args: NavBarSectionProps) => <NavBarSection {...args} />;
export const Closed = (args: NavBarSectionProps) => <NavBarSection {...args} />;

Open.args = openedSection;
Closed.args = closedSection;
