import React from 'react';
import { useSelector } from 'react-redux';
import { OrderSide } from '@energyweb/exchange-core';

import { Order } from '../../utils/exchange';
import { getOrders } from '../../features/orders/selectors';
import { getUserOffchain } from '../../features/users/selectors';
import { BidsTable } from './BidsTable';
import { AsksTable } from './AsksTable';
import { Box, useTheme } from '@material-ui/core';

export const MyOrders = () => {
    const user = useSelector(getUserOffchain);
    const orders: Order[] = useSelector(getOrders).filter(
        (o) => o.userId === user.organization.id.toString()
    );
    const asks = orders.filter((o) => o.side === OrderSide.Ask);
    const bids = orders.filter((o) => o.side === OrderSide.Bid);
    const {
        typography: { fontSizeMd }
    } = useTheme();
    return (
        <Box fontSize={fontSizeMd} className="OpenOrders">
            <Box>
                <BidsTable bids={bids} />
            </Box>
            <Box mt={3}>
                <AsksTable asks={asks} />
            </Box>
        </Box>
    );
};
