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
    pageRequirements,
    canAccessPage,
  } = useBlockchainInboxPageEffects();

  if (isLoading) return <CircularProgress />;

  if (!canAccessPage) {
    return <Requirements rules={pageRequirements} />;
  }

  return (
    <ItemsListWithActions
      emptyListComponent={<Typography>{noCertificatesText}</Typography>}
      {...listProps}
    />
  );
};

export const BlockchainInboxPage = withMetamask(Component);
