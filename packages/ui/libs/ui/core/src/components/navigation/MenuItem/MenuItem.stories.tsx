import React from 'react';
import { Meta } from '@storybook/react';
import { MenuItem, MenuItemProps } from './MenuItem';

export default {
  title: 'Navigation / MenuItem',
  component: MenuItem,
} as Meta;

export const Default = (args: MenuItemProps) => <MenuItem {...args} />;

Default.args = {
  label: 'Menu item label',
  url: '/item-link',
};
