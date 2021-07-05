import {
  ItemsListWithActions,
  ItemsListWithActionsProps,
  ListAction,
} from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import {
  ListItemContent,
  ListItemHeader,
  DepositAction,
  RetireAction,
} from '../../containers';

export const BlockchainInboxPage: FC = () => {
  const actions: ListAction[] = [
    {
      name: 'Deposit',
      content: <DepositAction />,
    },
    {
      name: 'Retire',
      content: <RetireAction />,
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

  return (
    <ItemsListWithActions
      listTitleProps={{ gutterBottom: true, variant: 'h5' }}
      itemsGridProps={{ mt: 6 }}
      listTitle="Blockchain Inbox"
      selectAllText="Select all"
      checkboxes
      containers={containers}
      actions={actions}
    />
  );
};
