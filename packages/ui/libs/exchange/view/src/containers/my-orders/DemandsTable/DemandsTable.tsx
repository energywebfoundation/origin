import React from 'react';
import { TableComponent } from '@energyweb/origin-ui-core';
import { useDemandsTableEffects } from './DemandsTable.effects';

export const DemandsTable = () => {
  const tableData = useDemandsTableEffects();
  return <TableComponent {...tableData} />;
};
