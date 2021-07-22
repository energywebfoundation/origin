import { ItemsListWithActions } from '@energyweb/origin-ui-core';
import { CircularProgress, Typography } from '@material-ui/core';
import React from 'react';
import { useCreateBundlePageEffects } from './CreateBundlePage.effects';

export const CreateBundlePage = () => {
  const { isLoading, listProps, noCertificatesText } =
    useCreateBundlePageEffects();

  if (isLoading) return <CircularProgress />;

  return (
    <ItemsListWithActions
      emptyListComponent={<Typography>{noCertificatesText}</Typography>}
      {...listProps}
    />
  );
};
