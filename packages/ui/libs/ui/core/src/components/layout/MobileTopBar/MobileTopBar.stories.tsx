import React from 'react';
import { Meta } from '@storybook/react';
import { MobileTopBar, MobileTopBarProps } from './MobileTopBar';

export default {
  title: 'Layout / MobileTopBar',
  component: MobileTopBar,
} as Meta;

export const Default = (args: MobileTopBarProps) => <MobileTopBar {...args} />;

Default.args = {
  onMobileNavOpen: () => {
    console.log('Mobile nav open');
  },
};
