import React from 'react';

import styled from '@emotion/styled';
import { TableComponent, TableRowData } from '@energyweb/origin-ui-core';
import { OrderDTO } from '../../../../../../../../api-clients/react-query/exchange-irec';

interface IExchangeMyOrdersOpenBidsTableRowDataConfig
  extends TableRowData<OrderDTO['id']> {}

/* eslint-disable-next-line */
export interface ExchangeMyOrdersOpenBidsTableProps {
  loading: boolean;
  data: any;
}

const columns = {};

export const ExchangeMyOrdersOpenBidsTable = ({
  loading,
  data,
}: ExchangeMyOrdersOpenBidsTableProps) => {
  return (
    <TableComponent
      loading={loading}
      data={data?.map(mapDataToTableRows)}
      header={columns}
    />
  );
};

const mapDataToTableRows = (
  el: OrderDTO
): IExchangeMyOrdersOpenBidsTableRowDataConfig => {
  return {
    id: el.id,
    actions: [],
  };
};

export default ExchangeMyOrdersOpenBidsTable;
