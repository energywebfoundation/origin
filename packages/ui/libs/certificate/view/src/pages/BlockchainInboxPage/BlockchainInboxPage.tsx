import { ItemsListWithActions, Requirements } from '@energyweb/origin-ui-core';
import { CircularProgress, Typography } from '@material-ui/core';

import React, { FC } from 'react';
import { withMetamask } from '@energyweb/origin-ui-blockchain';
import { useBlockchainInboxPageEffects } from './BlockchainInboxPage.effects';

const Component: FC = () => {
  const { isLoading, listProps, noCertificatesText, permissions } =
    useBlockchainInboxPageEffects();

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

export const BlockchainInboxPage = withMetamask(Component);
