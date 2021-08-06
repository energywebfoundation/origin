import React, { FC } from 'react';
import { ItemsListWithActions, Requirements } from '@energyweb/origin-ui-core';
import { CircularProgress, Typography } from '@material-ui/core';
import { useExchangeInboxPageEffects } from './ExchangeInboxPage.effects';

export const ExchangeInboxPage: FC = () => {
  const { isLoading, listProps, noCertificatesText, permissions } =
    useExchangeInboxPageEffects();

  if (isLoading) return <CircularProgress />;

  if (!permissions.canAccessPage) {
    return <Requirements {...permissions} />;
  }

  return (
    <ItemsListWithActions
      emptyListComponent={<Typography>{noCertificatesText}</Typography>}
      {...listProps}
    />
  );
};
