import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { Demand, DemandStatus } from '../utils/exchange';
import { ActiveOrders } from '../utils';
import { getOrders, getDemands } from '../features/orders/selectors';
import { BidsTable, AsksTable, DemandsTable } from '../components/orders';

export const MyOrders = () => {
    const demands: Demand[] = useSelector(getDemands).filter(
        (d) => d.status !== DemandStatus.ARCHIVED
    );
    const orders: ActiveOrders = new ActiveOrders(useSelector(getOrders));

    return (
        <Box className="OpenOrders">
            <Box mt={3}>
                <DemandsTable demands={demands} />
            </Box>
            <Box>
                <BidsTable bids={orders.bids} />
            </Box>
            <Box mt={3}>
                <AsksTable asks={orders.asks} />
            </Box>
        </Box>
    );
};
