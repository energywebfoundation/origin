import React from 'react';
import { Box } from '@material-ui/core';
import { usePermissions, Requirements, TableFallback } from '@energyweb/origin-ui-core';
import { BidsTable, AsksTable, DemandsTable } from '../../components';
import { useMyOrdersPageEffects } from './hooks/useMyOrdersPageEffects';

export const MyOrdersPage = () => {
    const { canAccessPage } = usePermissions();
    if (!canAccessPage?.value) {
        return <Requirements />;
    }
    const { activeOrders, allOrders, allDemands, demands } = useMyOrdersPageEffects();
    return (
        <Box className="OpenOrders">
            <Box mt={3}>
                {allDemands === null ? (
                    <TableFallback />
                ) : (
                    <DemandsTable demands={demands.active} />
                )}
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
