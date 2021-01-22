import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box } from '@material-ui/core';
import { DemandStatus } from '@energyweb/utils-general';
import { usePermissions, Requirements } from '@energyweb/origin-ui-core';
import { Demand } from '../utils/exchange';
import { ActiveOrders } from '../utils';
import { getOrders, getDemands } from '../features/orders/selectors';
import { BidsTable, AsksTable, DemandsTable } from '../components/orders';
import { fetchOrders } from '../features/orders';

export const MyOrders = () => {
    const { canAccessPage } = usePermissions();

    if (!canAccessPage?.value) {
        return <Requirements />;
    }

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchOrders());
    }, []);

    const demands: Demand[] = useSelector(getDemands).filter(
        (d) => d.status !== DemandStatus.ARCHIVED
    );
    const orders: ActiveOrders = new ActiveOrders(useSelector(getOrders));

    return (
        <Box className="OpenOrders">
            <Box mt={3}>
                <DemandsTable demands={demands} />
            </Box>
            <Box mt={3}>
                <BidsTable bids={orders.bids} />
            </Box>
            <Box mt={3}>
                <AsksTable asks={orders.asks} />
            </Box>
        </Box>
    );
};
