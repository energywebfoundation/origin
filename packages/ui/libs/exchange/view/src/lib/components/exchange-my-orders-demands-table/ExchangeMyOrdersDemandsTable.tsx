import React from 'react';

import styled from '@emotion/styled';
import { TableComponent, TableRowData } from '@energyweb/origin-ui-core';
import { OrderDTO } from '../../../../../../../../api-clients/react-query/exchange-irec';

interface IExchangeMyOrdersDemandsTableRowDataConfig
  extends TableRowData<OrderDTO['id']> {}

/* eslint-disable-next-line */
export interface ExchangeMyOrdersDemandsTableProps {
  loading: boolean;
  data: any;
}

const columns = {
  volume: 'demand.properties.volume',
  price: 'demand.properties.price',
  device_type: 'demand.properties.device_type',
  demandPeriod: 'demand.properties.period',
  demandStart: 'demand.properties.start',
  demandEnd: 'demand.properties.end',
  status: 'demand.properties.status',
};

export const ExchangeMyOrdersDemandsTable = ({
  loading,
  data,
}: ExchangeMyOrdersDemandsTableProps) => {
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
): IExchangeMyOrdersDemandsTableRowDataConfig => {
  return {
    id: el.id,
    actions: [],
  };
};

export default ExchangeMyOrdersDemandsTable;
