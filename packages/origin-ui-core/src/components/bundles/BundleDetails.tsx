import React from 'react';
import { Bundle } from '../../utils/exchange';
import { Dialog, DialogTitle, Grid, withStyles } from '@material-ui/core';
import { BundleContents } from './BudleContents';
import { BundleCardContainer } from './BundleCardContainer';

interface IOwnProps {
    selected: Bundle;
    showModal: boolean;
    callback: (showModal: boolean) => void;
    classes;
}

const BundleDetails = (props: IOwnProps) => {
    const { selected, showModal, callback, classes } = props;

    return (
        <Dialog
            open={showModal}
            onClose={callback}
            maxWidth="lg"
            fullWidth={true}
            classes={{ paper: classes.dialogPaper }}
        >
            <DialogTitle>BUNDLE DETAILS</DialogTitle>
            <Grid container>
                <Grid item xs={4}>
                    <BundleContents />
                </Grid>
                <Grid item xs={8}>
                    <BundleCardContainer />
                </Grid>
            </Grid>
        </Dialog>
    );
};

const styles = {
    dialogPaper: {
        minHeight: '80vh',
        maxHeight: '80vh'
    }
};

export default withStyles(styles)(BundleDetails);
