import React from 'react';
import { Meta } from '@storybook/react';
import {
  TextWithPendingDot,
  TextWithPendingDotProps,
} from './TextWithPendingDot';

export default {
  title: 'Utils / TextWithPendingDot',
  component: TextWithPendingDot,
} as Meta;

export const Default = (args: TextWithPendingDotProps) => (
  <TextWithPendingDot {...args} />
);

Default.args = {
  textContent: 'John Doe',
  pending: true,
  tooltipText: 'Pending user tooltip message',
};
