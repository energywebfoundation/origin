import React from 'react';

import styled from '@emotion/styled';
import { TableComponent, TableRowData } from '@energyweb/origin-ui-core';
import { OrderDTO } from '../../../../../../../../api-clients/react-query/exchange-irec';

interface IExchangeMyOrdersOpenAsksTableRowDataConfig
  extends TableRowData<OrderDTO['id']> {}

/* eslint-disable-next-line */
export interface ExchangeMyOrdersOpenAsksTableProps {
  loading: boolean;
  data: any;
}

const columns = {
  volume: 'order.properties.volume',
  price: 'order.properties.price',
  device_type: 'order.properties.device_type',
  generationFrom: 'order.properties.generation_start',
  generationTo: 'order.properties.generation_end',
  filled: 'order.properties.filled',
};

export const ExchangeMyOrdersOpenAsksTable = ({
  loading,
  data,
}: ExchangeMyOrdersOpenAsksTableProps) => {
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
): IExchangeMyOrdersOpenAsksTableRowDataConfig => {
  return {
    id: el.id,
    actions: [],
  };
};

export default ExchangeMyOrdersOpenAsksTable;
