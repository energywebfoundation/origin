import React from 'react';
import { Dialog } from '@material-ui/core';
import { Order } from '../../utils/exchange';

interface IOwnProps {
    bid: Order;
    close: () => void;
}

export const BidsDetailsModal = (props: IOwnProps) => {
    const { bid, close } = props;
    return (
        <Dialog open={bid !== null} onClose={close}>
            View ask details modal
        </Dialog>
    );
};
