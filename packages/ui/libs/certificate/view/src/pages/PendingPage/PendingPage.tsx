import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { usePendingPageEffects } from './PendingPage.effects';

export const PendingPage: FC = () => {
  const { tableData, permissions } = usePendingPageEffects();

  if (!permissions.canAccessPage) {
    return <Requirements {...permissions} />;
  }

  return <TableComponent {...tableData} />;
};
