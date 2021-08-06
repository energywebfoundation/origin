import React from 'react';
import { ItemsListWithActions, Requirements } from '@energyweb/origin-ui-core';
import { CircularProgress, Typography } from '@material-ui/core';
import { useCreateBundlePageEffects } from './CreateBundlePage.effects';

export const CreateBundlePage = () => {
  const { isLoading, listProps, noCertificatesText, permissions } =
    useCreateBundlePageEffects();

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
