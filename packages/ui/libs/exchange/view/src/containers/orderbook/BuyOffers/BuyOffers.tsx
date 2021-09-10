import React, { FC } from 'react';
import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { TableComponent } from '@energyweb/origin-ui-core';
import { Box } from '@material-ui/core';
import { useBuyOffersEffects } from './BuyOffers.effects';

interface BuyOffersProps {
  bids: OrderBookOrderDTO[];
  isLoading: boolean;
}

export const BuyOffers: FC<BuyOffersProps> = ({ bids, isLoading }) => {
  const { tableProps, mobileView } = useBuyOffersEffects(bids, isLoading);
  return (
    <Box py={mobileView ? 2 : 4} px={mobileView ? 0 : 4}>
      <TableComponent {...tableProps} />
    </Box>
  );
};
