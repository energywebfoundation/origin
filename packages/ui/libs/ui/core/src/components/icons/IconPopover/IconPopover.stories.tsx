import React from 'react';
import { Meta } from '@storybook/react';
import { IconPopover, IconPopoverProps } from './IconPopover';

export default {
  title: 'Icons / IconPopover',
  component: IconPopover,
} as Meta;

export const Default = (args: IconPopoverProps) => <IconPopover {...args} />;

Default.args = {};
