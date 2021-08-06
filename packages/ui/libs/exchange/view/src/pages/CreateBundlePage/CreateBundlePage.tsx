import React from 'react';
import { ItemsListWithActions, Requirements } from '@energyweb/origin-ui-core';
import { CircularProgress, Typography } from '@material-ui/core';
import { useCreateBundlePageEffects } from './CreateBundlePage.effects';

export const CreateBundlePage = () => {
  const {
    isLoading,
    listProps,
    noCertificatesText,
    canAccessPage,
    requirementsProps,
  } = useCreateBundlePageEffects();

  if (isLoading) return <CircularProgress />;

  if (!canAccessPage) {
    return <Requirements {...requirementsProps} />;
  }

  return (
    <ItemsListWithActions
      emptyListComponent={<Typography>{noCertificatesText}</Typography>}
      {...listProps}
    />
  );
};
