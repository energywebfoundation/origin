import React, { FC } from 'react';
import { TableComponent, Requirements } from '@energyweb/origin-ui-core';
import { useSupplyPageEffects } from './SupplyPage.effects';

export const SupplyPage: FC = () => {
  const { tableData, canAccessPage } = useSupplyPageEffects();

  if (!canAccessPage) {
    return <Requirements />;
  }

  return <TableComponent {...tableData} />;
};
