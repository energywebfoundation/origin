import React, { memo } from 'react';

import { useExchangeMyTradesPageEffects } from './ExchangeMyTradesPage.effects';
import { TableComponent, TableRowData } from '@energyweb/origin-ui-core';
import {
  TradeDTO,
  OrderSide,
} from '@energyweb/exchange-irec-react-query-client';
import { toBN } from '@energyweb/origin-ui-utils';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

interface IExchangeMyTradesTableRowDataConfig extends TableRowData<number> {
  date: string;
  side: OrderSide;
  volume: string;
  price: string;
  total: string;
}

/* eslint-disable-next-line */
export interface ExchangeMyTradesPageProps {}

export const ExchangeMyTradesPage = memo(() => {
  const { isLoading, data, columns } = useExchangeMyTradesPageEffects();
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h3" gutterBottom>
        {t('exchange.info.myTrades')}
      </Typography>
      <TableComponent
        loading={isLoading}
        data={data?.map(mapDataToTableRows)}
        header={columns}
      />
    </>
  );
});

ExchangeMyTradesPage.displayName = 'ExchangeMyTradesPage';

const mapDataToTableRows = (
  el: TradeDTO
): IExchangeMyTradesTableRowDataConfig => {
  const volumeBN = toBN(el.volume);
  const priceBN = toBN(el.price);
  const side = el.bidId ? OrderSide.Bid : OrderSide.Ask;
  return {
    id: Number(el.id),
    side,
    date: el.created,
    price: priceBN.toString(),
    volume: volumeBN.toString(),
    total: priceBN.mul(volumeBN).toString(),
    actions: [],
  };
};

export default ExchangeMyTradesPage;
