import React from 'react';
import { useSelector } from 'react-redux';
import { OrderSide, OrderStatus } from '@energyweb/exchange-core';

import { Order } from '../../utils/exchange';
import { getOrders } from '../../features/orders/selectors';
import { BidsTable } from './BidsTable';
import { AsksTable } from './AsksTable';
import { Box } from '@material-ui/core';

export const MyOrders = () => {
    const orders: Order[] = useSelector(getOrders).filter(
        (o) => o.status === OrderStatus.Active || o.status === OrderStatus.PartiallyFilled
    );
    const asks = orders.filter((o) => o.side === OrderSide.Ask);
    const bids = orders.filter((o) => o.side === OrderSide.Bid);
    return (
        <Box className="OpenOrders">
            <Box>
                <BidsTable bids={bids} />
            </Box>
            <Box mt={3}>
                <AsksTable asks={asks} />
            </Box>
        </Box>
    );
};
