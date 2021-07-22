import { TableComponent } from '@energyweb/origin-ui-core';
import React from 'react';
import { FC } from 'react';
import { useRequestsPageEffects } from './RequestsPage.effects';

export const RequestsPage: FC = () => {
  const { tableData } = useRequestsPageEffects();

  return <TableComponent {...tableData} />;
};
