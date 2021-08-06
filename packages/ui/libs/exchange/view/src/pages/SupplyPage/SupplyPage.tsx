import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { useSupplyPageEffects } from './SupplyPage.effects';

export const SupplyPage: FC = () => {
  const { tableData, permissions } = useSupplyPageEffects();

  if (!permissions.canAccessPage) {
    return <Requirements {...permissions} />;
  }

  return <TableComponent {...tableData} />;
};
