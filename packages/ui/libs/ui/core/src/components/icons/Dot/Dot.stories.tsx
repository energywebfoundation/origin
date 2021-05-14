import { Dot, DotProps } from './Dot';
import { Meta } from '@storybook/react';
import React from 'react';

export default {
  title: 'Utils / Dot',
  component: Dot,
} as Meta;

export const Default = (args: DotProps) => <Dot {...args} />;
