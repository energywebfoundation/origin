import { TableComponent } from '@energyweb/origin-ui-core';
import { TOrderBookData } from '@energyweb/origin-ui-exchange-data';
import { Box, Grid } from '@material-ui/core';
import React, { FC } from 'react';
import { OrderBookTableHeader } from '../OrderBookTableHeader';
import { useTradingViewEffects } from './TradingView.effects';

export interface TradingViewProps {
  orderBookData: TOrderBookData;
  isLoading: boolean;
}

export const TradingView: FC<TradingViewProps> = (props) => {
  const {
    asksTableProps,
    bidsTableProps,
    asksTitle,
    bidsTitle,
    popoverTextAsks,
    popoverTextBids,
    mobileView,
  } = useTradingViewEffects(props);

  return (
    <Box py={mobileView ? 2 : 4} px={mobileView ? 0 : 4}>
      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <OrderBookTableHeader
            title={asksTitle}
            ordersTotalVolume={props.orderBookData?.totalAsks}
            currentOrders={props.orderBookData?.asks?.length}
            popoverText={popoverTextAsks}
          />
          <TableComponent {...asksTableProps} />
        </Grid>
        <Grid item md={6} xs={12}>
          <OrderBookTableHeader
            title={bidsTitle}
            ordersTotalVolume={props.orderBookData?.totalBids}
            currentOrders={props.orderBookData?.bids?.length}
            popoverText={popoverTextBids}
          />
          <TableComponent {...bidsTableProps} />
        </Grid>
      </Grid>
    </Box>
  );
};
