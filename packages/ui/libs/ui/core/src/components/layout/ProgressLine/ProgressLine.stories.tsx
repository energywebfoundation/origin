import { ProgressLine } from './ProgressLine';
import { Meta } from '@storybook/react';
import React from 'react';

export default {
  title: 'Utils / ProgressLine',
  component: ProgressLine,
} as Meta;

export const Default = (args) => <ProgressLine {...args} />;
