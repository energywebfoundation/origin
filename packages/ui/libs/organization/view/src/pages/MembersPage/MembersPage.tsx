import { TableComponent } from '@energyweb/origin-ui-core';
import React from 'react';
import { FC } from 'react';
import { useMembersPageEffects } from './MembersPage.effects';

export const MembersPage: FC = () => {
  const { tableData } = useMembersPageEffects();

  return <TableComponent {...tableData} />;
};
