import React, { FC } from 'react';
import { OrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { TableComponent } from '@energyweb/origin-ui-core';
import { useAsksTableEffects } from './AsksTable.effects';

export interface AsksTableProps {
  asks: OrderDTO[];
  isLoading: boolean;
}

export const AsksTable: FC<AsksTableProps> = (props) => {
  const tableData = useAsksTableEffects(props);
  return <TableComponent {...tableData} />;
};
