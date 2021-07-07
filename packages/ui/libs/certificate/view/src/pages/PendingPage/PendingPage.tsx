import { TableComponent } from '@energyweb/origin-ui-core';
import React from 'react';
import { FC } from 'react';
import { usePendingPageEffects } from './PendingPage.effects';

export const PendingPage: FC = () => {
  const { tableData } = usePendingPageEffects();

  return <TableComponent {...tableData} />;
};
