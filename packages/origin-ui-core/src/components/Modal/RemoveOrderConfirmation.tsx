import React from 'react';
import { Dialog } from '@material-ui/core';
import { Order } from '../../utils/exchange';

interface IOwnProps {
    order: Order;
    close: () => void;
}

export const RemoveOrderConfirmation = (props: IOwnProps) => {
    const { order, close } = props;
    return (
        <Dialog open={order !== null} onClose={close}>
            View ask details modal
        </Dialog>
    );
};
