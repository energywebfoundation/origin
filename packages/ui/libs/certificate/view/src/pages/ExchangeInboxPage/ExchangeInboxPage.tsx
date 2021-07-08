import { ItemsListWithActions } from '@energyweb/origin-ui-core';
import { CircularProgress, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { useExchangeInboxPageEffects } from './ExchangeInboxPage.effects';

export const ExchangeInboxPage: FC = () => {
  const { isLoading, listProps } = useExchangeInboxPageEffects();

  if (isLoading) return <CircularProgress />;

  return (
    <ItemsListWithActions
      emptyListComponent={
        <Typography>You don't have any certificates</Typography>
      }
      {...listProps}
    />
  );
};
