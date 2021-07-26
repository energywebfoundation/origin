import React, { FC } from 'react';
import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { useBuyOffersEffects } from './BuyOffers.effects';
import { TableComponent } from '@energyweb/origin-ui-core';
import { Box } from '@material-ui/core';

interface BuyOffersProps {
  bids: OrderBookOrderDTO[];
  isLoading: boolean;
}

export const BuyOffers: FC<BuyOffersProps> = ({ bids, isLoading }) => {
  const tableProps = useBuyOffersEffects(bids, isLoading);
  return (
    <Box p={4}>
      <TableComponent {...tableProps} />
    </Box>
  );
};
