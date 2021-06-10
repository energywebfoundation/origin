import React from 'react';

import {
  ITableSortConfig,
  TableComponent,
  TableRowData,
} from '@energyweb/origin-ui-core';
import { useExchangeSupplyPageEffects } from './ExchangeSupplyPage.effects';
import { SupplyDto } from '@energyweb/exchange-react-query-client';

interface IExchangeSupplyTableRowDataConfig
  extends TableRowData<SupplyDto['id']> {}

/* eslint-disable-next-line */
export interface ExchangeSupplyPageProps {}

const columns: {
  [k in keyof Omit<IExchangeSupplyTableRowDataConfig, 'id'>];
} = {};
export const ExchangeSupplyPage = () => {
  const { isLoading, data } = useExchangeSupplyPageEffects();
  const sortConfig: ITableSortConfig<typeof columns> = {
    sortableColumns: { total: { sortOrder: 'ASC' } },
  };
  return (
    <TableComponent
      sortConfig={sortConfig}
      loading={isLoading}
      data={data?.map(mapDataToTableRows)}
      header={columns}
    />
  );
};

const mapDataToTableRows = (
  el: SupplyDto
): IExchangeSupplyTableRowDataConfig => {
  return {
    id: el.id,
    actions: [],
  };
};

export default ExchangeSupplyPage;
