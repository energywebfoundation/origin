import { Box } from '@material-ui/core';
import React from 'react';
import { DemandsTable, BidsTable, AsksTable } from '../../containers';
import { useMyOrdersPageEffects } from './MyOrdersPage.effects';

export const MyOrdersPage = () => {
  const { bids, asks, isLoading } = useMyOrdersPageEffects();
  return (
    <Box width="100%">
      <Box my={3}>
        <DemandsTable />
      </Box>
      <Box my={3}>
        <BidsTable bids={bids} isLoading={isLoading} />
      </Box>
      <Box my={3}>
        <AsksTable asks={asks} isLoading={isLoading} />
      </Box>
    </Box>
  );
};
