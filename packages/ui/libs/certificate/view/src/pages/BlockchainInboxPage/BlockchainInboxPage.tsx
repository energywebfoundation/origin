import { ItemsListWithActions, Requirements } from '@energyweb/origin-ui-core';
import { CircularProgress, Typography } from '@material-ui/core';

import React, { FC } from 'react';
import { withMetamask } from '@energyweb/origin-ui-blockchain';
import { useBlockchainInboxPageEffects } from './BlockchainInboxPage.effects';

const Component: FC = () => {
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

export const BlockchainInboxPage = withMetamask(Component);
