import React, { useState } from 'react';
import { Dialog, DialogTitle, Grid, DialogContent } from '@material-ui/core';
import { Certificates } from './Certificates';
import { SelectedForSale } from './SelectedForSale';
import { ICertificateViewItem } from '../../features/certificates';
import { BigNumber } from 'ethers/utils';

interface IOwnProps {
    showModal: boolean;
    callback: () => void;
}

export const CreateBundleForm = (props: IOwnProps) => {
    const { showModal, callback } = props;
    const [selected, setSelected] = useState<ICertificateViewItem[]>([]);

    const totalVolume = (): BigNumber => {
        return selected.reduce(
            (total, { energy: { publicVolume, privateVolume } }) =>
                total.add(publicVolume).add(privateVolume),
            new BigNumber(0)
        );
    };

    return (
        <Dialog
            open={showModal}
            onClose={callback}
            maxWidth="lg"
            fullWidth
            disableBackdropClick
            scroll="body"
        >
            <DialogTitle>{`Create bundle`}</DialogTitle>
            <DialogContent>
                <div>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <Certificates selected={selected} setSelected={setSelected} />
                        </Grid>
                        <Grid item xs={6}>
                            <SelectedForSale
                                selected={selected}
                                totalVolume={totalVolume()}
                                callback={callback}
                            />
                        </Grid>
                    </Grid>
                </div>
            </DialogContent>
        </Dialog>
    );
};
