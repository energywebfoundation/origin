import React, { FC } from 'react';
import { TableComponent } from '@energyweb/origin-ui-core';
import { useSupplyPageEffects } from './SupplyPage.effects';

interface SupplyPageProps {}

export const SupplyPage: FC<SupplyPageProps> = () => {
  const { tableData } = useSupplyPageEffects();

  return <TableComponent {...tableData} />;
};
