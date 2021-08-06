import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { useMyTradesPageEffects } from './MyTradesPage.effects';

export const MyTradesPage: FC = () => {
  const { tableData, permissions } = useMyTradesPageEffects();

  if (!permissions.canAccessPage) {
    return <Requirements {...permissions} />;
  }

  return <TableComponent {...tableData} />;
};
