import { TableComponent } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@material-ui/core';
import React from 'react';
import { FC } from 'react';
import { useMembersPageEffects } from './MembersPage.effects';

export const MembersPage: FC = () => {
  const { isLoading, tableData } = useMembersPageEffects();

  if (isLoading) {
    return <CircularProgress />;
  }

  return <TableComponent {...tableData} />;
};
