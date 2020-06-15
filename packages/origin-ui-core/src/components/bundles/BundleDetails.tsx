import React from 'react';
import { Bundle } from '../../utils/exchange';
import { Dialog, DialogTitle } from '@material-ui/core';

interface IOwnProps {
    bundle: Bundle;
    showModal: boolean;
}

export const BundleDetails = (props: IOwnProps) => {
    const { showModal } = props;
    return (
        <Dialog open={showModal}>
            <DialogTitle>{`Detailed view for ${props.bundle?.id}`}</DialogTitle>
        </Dialog>
    );
};
