import { ProgressLine } from './ProgressLine';
import { Meta, Story } from '@storybook/react';
import React from 'react';

export default {
  title: 'Utils / ProgressLine',
  component: ProgressLine,
} as Meta;

export const Default: Story = () => <ProgressLine />;
