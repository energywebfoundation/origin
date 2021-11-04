import React from 'react';
import { Meta } from '@storybook/react';
import { Check } from '@mui/icons-material';
import { IconLink, IconLinkProps } from './IconLink';

export default {
  title: 'Icons / IconLink',
  component: IconLink,
} as Meta;

export const CheckIcon = (args: IconLinkProps) => (
  <IconLink {...args}>
    <Check />
  </IconLink>
);

CheckIcon.args = {
  url: '/',
};
