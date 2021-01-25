import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box } from '@material-ui/core';
import { usePermissions, Requirements, TableFallback } from '@energyweb/origin-ui-core';
import { ActiveOrders, ActiveDemands } from '../utils';
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

    const allDemands = useSelector(getDemands);
    const activeDemands: ActiveDemands = new ActiveDemands(allDemands);

    const allOrders = useSelector(getOrders);
    const activeOrders: ActiveOrders = new ActiveOrders(allOrders);

    return (
        <Box className="OpenOrders">
            <Box mt={3}>
                {allDemands === null ? <TableFallback /> : <DemandsTable demands={activeDemands} />}
            </Box>
            <Box mt={3}>
                {allOrders === null ? <TableFallback /> : <BidsTable bids={activeOrders.bids} />}
            </Box>
            <Box mt={3}>
                {allOrders === null ? <TableFallback /> : <AsksTable asks={activeOrders.asks} />}
            </Box>
        </Box>
    );
};
