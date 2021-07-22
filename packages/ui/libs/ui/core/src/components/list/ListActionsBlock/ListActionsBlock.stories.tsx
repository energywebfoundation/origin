import React from 'react';
import { Meta } from '@storybook/react';
import { ListActionsBlock, ListActionsBlockProps } from './ListActionsBlock';
import { Typography } from '@material-ui/core';

export default {
  title: 'List / ListActionsBlock',
  component: ListActionsBlock,
} as Meta;

export const Default = (args: ListActionsBlockProps) => {
  return <ListActionsBlock {...args} />;
};

Default.args = {
  actions: [
    { name: 'Sell', content: <Typography>Sell action text</Typography> },
    { name: 'Buy', content: <Typography>Buy action text</Typography> },
  ],
};
