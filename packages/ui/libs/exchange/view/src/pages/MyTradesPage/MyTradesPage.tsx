import React, { FC } from 'react';
import { TableComponent } from '@energyweb/origin-ui-core';
import { useMyTradesPageEffects } from './MyTradesPage.effects';

export const MyTradesPage: FC = () => {
  const { tableData } = useMyTradesPageEffects();

  return <TableComponent {...tableData} />;
};
