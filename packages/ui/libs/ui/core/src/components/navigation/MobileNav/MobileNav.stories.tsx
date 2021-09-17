import React from 'react';
import { MobileNav, MobileNavProps } from './MobileNav';
import { Meta } from '@storybook/react';

export default {
  title: 'Navigation / MobileNav',
  component: MobileNav,
} as Meta;

export const Default = (args: MobileNavProps) => <MobileNav {...args} />;

const section1MenuList = [
  {
    url: 'menu_item_one',
    label: 'Item one',
    show: true,
  },
  {
    url: 'menu_item_two',
    label: 'Item two',
    show: true,
  },
];
const section2MenuList = [
  {
    url: 'menu_item_one',
    label: 'Item one',
    show: true,
  },
  {
    url: 'menu_item_two',
    label: 'Item two',
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
  open: true,
  onClose: () => {
    console.log('Mobile close');
  },
  menuSections,
};
