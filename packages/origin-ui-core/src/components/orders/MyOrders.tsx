import React from 'react';
import { useSelector } from 'react-redux';
import { OrderSide, OrderStatus } from '@energyweb/exchange-core';

import { Order, Demand, DemandStatus } from '../../utils/exchange';
import { getOrders, getDemands } from '../../features/orders/selectors';
import { BidsTable } from './BidsTable';
import { AsksTable } from './AsksTable';
import { Box } from '@material-ui/core';
import { DemandsTable } from './DemandsTable';

export const MyOrders = () => {
    const demands: Demand[] = useSelector(getDemands).filter(
        (d) => d.status !== DemandStatus.ARCHIVED
    );
    const orders: Order[] = useSelector(getOrders).filter(
        (o) => o.status === OrderStatus.Active || o.status === OrderStatus.PartiallyFilled
    );
    const asks = orders.filter((o) => o.side === OrderSide.Ask);
    const bids = orders.filter(
        (o) => o.side === OrderSide.Bid && !{}.hasOwnProperty.call(o, 'demandId')
    );
    return (
        <Box className="OpenOrders">
            <Box mt={3}>
                <DemandsTable demands={demands} />
            </Box>
            <Box>
                <BidsTable bids={bids} />
            </Box>
            <Box mt={3}>
                <AsksTable asks={asks} />
            </Box>
        </Box>
    );
};
