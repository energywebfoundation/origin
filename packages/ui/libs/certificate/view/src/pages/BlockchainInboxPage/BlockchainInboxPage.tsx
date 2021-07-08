import {
  ItemsListWithActions,
  ItemsListWithActionsProps,
  ListAction,
} from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
// import { DepositAction, RetireAction } from '../../containers';

export const BlockchainInboxPage: FC = () => {
  const actions: ListAction[] = [
    // {
    //   name: 'Deposit',
    //   content: <DepositAction />,
    // },
    // {
    //   name: 'Retire',
    //   content: <RetireAction />,
    // },
  ];

  const containers: ItemsListWithActionsProps<number, string>['containers'] =
    new Map();

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
