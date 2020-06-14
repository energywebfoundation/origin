import React from 'react';
import { Dialog, DialogTitle, Grid, DialogContent, Paper } from '@material-ui/core';

interface IOwnProps {
    showModal: boolean;
    callback: () => void;
}

export const CreateBundleForm = (props: IOwnProps) => {
    const { showModal, callback } = props;

    return (
        <Dialog open={showModal} onClose={callback}>
            <DialogTitle>{`Create bundle modal`}</DialogTitle>
            <DialogContent>
                <div>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <Paper>Certificates</Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper>Selected for sale</Paper>
                        </Grid>
                    </Grid>
                </div>
            </DialogContent>
        </Dialog>
    );
};
