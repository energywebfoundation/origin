import React from 'react';
import { Dialog } from '@material-ui/core';
import { Order } from '../../utils/exchange';

interface IOwnProps {
    ask: Order;
    close: () => void;
}

export const AskDetailsModal = (props: IOwnProps) => {
    const { ask, close } = props;
    return (
        <Dialog open={ask !== null} onClose={close}>
            View ask details modal
        </Dialog>
    );
};
