import React, { FC } from 'react';
import { OrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { TableComponent } from '@energyweb/origin-ui-core';
import { useBidsTableEffects } from './BidsTable.effects';

export interface BidsTableProps {
  bids: OrderDTO[];
  isLoading: boolean;
}

export const BidsTable: FC<BidsTableProps> = (props) => {
  const tableData = useBidsTableEffects(props);
  return <TableComponent {...tableData} />;
};
