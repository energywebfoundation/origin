import React from 'react';
import { Meta } from '@storybook/react';
import { CloseButton, CloseButtonProps } from './CloseButton';

export default {
  title: 'Icons / CloseButton',
  component: CloseButton,
} as Meta;

export const Default = (args: CloseButtonProps) => <CloseButton {...args} />;

Default.args = {
  onClose: () => {
    console.log('close button clicked');
  },
};
