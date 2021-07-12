import { ItemsListWithActions } from '@energyweb/origin-ui-core';
import { CircularProgress, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { withMetamask } from '@energyweb/origin-ui-blockchain';
import { useBlockchainInboxPageEffects } from './BlockchainInboxPage.effects';

const Component: FC = () => {
  const { isLoading, listProps, noCertificatesText } =
    useBlockchainInboxPageEffects();

  if (isLoading) return <CircularProgress />;

  return (
    <ItemsListWithActions
      emptyListComponent={<Typography>{noCertificatesText}</Typography>}
      {...listProps}
    />
  );
};

export const BlockchainInboxPage = withMetamask(Component);
