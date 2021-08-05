import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { useRequestsPageEffects } from './RequestsPage.effects';

export const RequestsPage: FC = () => {
  const { tableData, canAccessPage } = useRequestsPageEffects();

  if (!canAccessPage) {
    return <Requirements />;
  }

  return <TableComponent {...tableData} />;
};
