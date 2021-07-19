import React, { FC } from 'react';
import { TableComponent } from '@energyweb/origin-ui-core';
import { usePendingPageEffects } from './PendingPage.effects';

export const PendingPage: FC = () => {
  const { tableData } = usePendingPageEffects();

  return <TableComponent {...tableData} />;
};
