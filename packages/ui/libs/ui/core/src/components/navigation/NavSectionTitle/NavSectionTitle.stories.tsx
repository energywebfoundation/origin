import React from 'react';
import { Meta } from '@storybook/react';
import { NavSectionTitle, NavSectionTitleProps } from './NavSectionTitle';

export default {
  title: 'Navigation / NavSectionTitle',
  component: NavSectionTitle,
} as Meta;

export const Default = (args: NavSectionTitleProps) => (
  <NavSectionTitle {...args} />
);

Default.args = {
  title: 'Section Title',
  url: '/section-title',
  clickHandler: () => {
    console.log('Title clicked');
  },
};
