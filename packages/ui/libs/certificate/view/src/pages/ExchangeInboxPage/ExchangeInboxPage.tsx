import {
  ItemsListWithActions,
  ItemsListWithActionsProps,
  ListAction,
} from '@energyweb/origin-ui-core';
import { CircularProgress } from '@material-ui/core';
import React, { FC } from 'react';
import {
  ListItemContent,
  ListItemHeader,
  SellAction,
  WithdrawAction,
} from '../../containers';
import { useExchangeInboxPageEffects } from './ExchangeInboxPage.effects';

export const ExchangeInboxPage: FC = () => {
  const { isLoading } = useExchangeInboxPageEffects();

  const actions: ListAction[] = [
    {
      name: 'Sell',
      content: <SellAction />,
    },
    {
      name: 'Withdraw',
      content: <WithdrawAction />,
    },
  ];

  const containers: ItemsListWithActionsProps<number, string>['containers'] =
    new Map();

  containers.set(1, {
    containerComponent: (
      <ListItemHeader name="Wuthering Heights Farm" country="Thailand" />
    ),
    containerListItemProps: { style: { padding: 8 } },
    itemListItemProps: { style: { padding: 8 } },
    items: [
      {
        id: '1',
        component: <ListItemContent />,
      },
    ],
  });
  containers.set(2, {
    containerComponent: (
      <ListItemHeader name="Solar Facility A" country="Australia" />
    ),
    containerListItemProps: { style: { padding: 8 } },
    itemListItemProps: { style: { padding: 8 } },
    items: [
      {
        id: '2',
        component: <ListItemContent />,
      },
      {
        id: '3',
        component: <ListItemContent />,
      },
    ],
  });

  if (isLoading) return <CircularProgress />;

  return (
    <ItemsListWithActions
      listTitleProps={{ gutterBottom: true, variant: 'h5' }}
      itemsGridProps={{ mt: 6 }}
      listTitle="Exchange Inbox"
      selectAllText="Select all"
      checkboxes
      containers={containers}
      actions={actions}
    />
  );
};
