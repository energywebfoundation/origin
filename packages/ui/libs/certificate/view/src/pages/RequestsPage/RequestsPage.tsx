import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { useRequestsPageEffects } from './RequestsPage.effects';

export const RequestsPage: FC = () => {
  const { tableData, permissions } = useRequestsPageEffects();

  if (!permissions.canAccessPage) {
    return <Requirements {...permissions} />;
  }

  return <TableComponent {...tableData} />;
};
