import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { usePendingPageEffects } from './PendingPage.effects';

export const PendingPage: FC = () => {
  const { tableData, canAccessPage } = usePendingPageEffects();

  if (!canAccessPage) {
    return <Requirements />;
  }

  return <TableComponent {...tableData} />;
};
