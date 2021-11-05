import { ItemsListWithActions, Requirements } from '@energyweb/origin-ui-core';
import { CircularProgress, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useBlockchainInboxPageEffects } from './BlockchainInboxPage.effects';

export const BlockchainInboxPage: FC = () => {
  const {
    isLoading,
    listProps,
    noCertificatesText,
    canAccessPage,
    requirementsProps,
    txPending,
  } = useBlockchainInboxPageEffects();

  if (isLoading) return <CircularProgress />;

  if (!canAccessPage) {
    return <Requirements {...requirementsProps} />;
  }

  return (
    <ItemsListWithActions
      emptyListComponent={<Typography>{noCertificatesText}</Typography>}
      disabled={txPending}
      {...listProps}
    />
  );
};

export default BlockchainInboxPage;
