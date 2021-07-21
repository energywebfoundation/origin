import React, { FC } from 'react';
import { TableComponent } from '@energyweb/origin-ui-core';
import { useSupplyPageEffects } from './SupplyPage.effects';

export const SupplyPage: FC = () => {
  const { tableData } = useSupplyPageEffects();

  return <TableComponent {...tableData} />;
};
