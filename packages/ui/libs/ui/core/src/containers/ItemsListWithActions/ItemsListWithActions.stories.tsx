import React from 'react';
import { Meta } from '@storybook/react';
import { ItemsListWithActions } from './ItemsListWithActions';
import { ItemsListWithActionsProps } from './ItemsListWithActions.types';
import { Typography } from '@material-ui/core';

export default {
  title: 'Containers / ItemsListWithActions',
  component: ItemsListWithActions,
} as Meta;

export const WithoutCheckboxes = (
  args: Omit<ItemsListWithActionsProps<number, number>, 'containers'>
) => {
  const containers: ItemsListWithActionsProps<number, string>['containers'] =
    new Map();

  containers.set(1, {
    containerComponent: <Typography>First container</Typography>,
    items: [
      {
        id: '1',
        component: (
          <Typography>This is the first item of first container</Typography>
        ),
      },
    ],
  });
  containers.set(2, {
    containerComponent: <Typography>Second container</Typography>,
    items: [
      {
        id: '2',
        component: (
          <Typography>This is the first item of second container</Typography>
        ),
      },
      {
        id: '3',
        component: (
          <Typography>This is the second item of second container</Typography>
        ),
      },
    ],
  });

  return <ItemsListWithActions containers={containers} {...args} />;
};

WithoutCheckboxes.args = {
  actions: [
    { name: 'Sell', content: <Typography>Sell action text</Typography> },
    { name: 'Buy', content: <Typography>Buy action text</Typography> },
  ],
  listTitle: 'Items list with Actions',
  selectAllText: 'Select all items and containers',
};

export const WithCheckboxes = (
  args: Omit<ItemsListWithActionsProps<number, number>, 'containers'>
) => {
  const containers: ItemsListWithActionsProps<number, string>['containers'] =
    new Map();

  containers.set(1, {
    containerComponent: <Typography>First container</Typography>,
    items: [
      {
        id: '1',
        component: (
          <Typography>This is the first item of first container</Typography>
        ),
      },
    ],
  });
  containers.set(2, {
    containerComponent: <Typography>Second container</Typography>,
    items: [
      {
        id: '2',
        component: (
          <Typography>This is the first item of second container</Typography>
        ),
      },
      {
        id: '3',
        component: (
          <Typography>This is the second item of second container</Typography>
        ),
      },
    ],
  });

  return <ItemsListWithActions containers={containers} {...args} />;
};

WithCheckboxes.args = {
  actions: [
    { name: 'Sell', content: <Typography>Sell action text</Typography> },
    { name: 'Buy', content: <Typography>Buy action text</Typography> },
  ],
  listTitle: 'Items list with Actions',
  selectAllText: 'Select all items and containers',
  checkboxes: true,
};

export const WithPagination = (
  args: Omit<ItemsListWithActionsProps<number, number>, 'containers'>
) => {
  const containers: ItemsListWithActionsProps<number, string>['containers'] =
    new Map();

  containers.set(1, {
    containerComponent: <Typography>First container</Typography>,
    items: [
      {
        id: '1',
        component: (
          <Typography>This is the first item of first container</Typography>
        ),
      },
    ],
  });
  containers.set(2, {
    containerComponent: <Typography>Second container</Typography>,
    items: [
      {
        id: '2',
        component: (
          <Typography>This is the first item of second container</Typography>
        ),
      },
      {
        id: '3',
        component: (
          <Typography>This is the second item of second container</Typography>
        ),
      },
    ],
  });

  return <ItemsListWithActions containers={containers} {...args} />;
};

WithPagination.args = {
  actions: [
    { name: 'Sell', content: <Typography>Sell action text</Typography> },
    { name: 'Buy', content: <Typography>Buy action text</Typography> },
  ],
  listTitle: 'Items list with Actions',
  selectAllText: 'Select all items and containers',
  pagination: true,
  pageSize: 1,
};
