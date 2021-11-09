import { TableComponent } from '@energyweb/origin-ui-core';
import { Skeleton } from '@mui/material';
import React from 'react';
import { FC } from 'react';
import { useMembersPageEffects } from './MembersPage.effects';

export const MembersPage: FC = () => {
  const { tableData, pageLoading } = useMembersPageEffects();

  if (pageLoading) {
    return <Skeleton height={200} width="100%" />;
  }

  return <TableComponent {...tableData} />;
};

export default MembersPage;
