import React, { FC } from 'react';
import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import { useSellOffersEffects } from './SellOffers.effects';
import { TableComponent } from '@energyweb/origin-ui-core';
import { Box } from '@material-ui/core';

interface SellOffersProps {
  asks: OrderBookOrderDTO[];
  isLoading: boolean;
}

export const SellOffers: FC<SellOffersProps> = ({ asks, isLoading }) => {
  const tableProps = useSellOffersEffects(asks, isLoading);
  return (
    <Box p={4}>
      <TableComponent {...tableProps} />
    </Box>
  );
};
