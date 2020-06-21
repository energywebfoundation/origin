import React, { useState } from 'react';
import { Bundle } from '../../utils/exchange';
import { Dialog, DialogTitle, Grid, withStyles, Box } from '@material-ui/core';
import { BundleContents } from './BudleContents';
import { BundleCardContainer } from './BundleCardContainer';

interface IOwnProps {
    selected: Bundle;
    showModal: boolean;
    callback: (showModal: boolean) => void;
    classes;
}

const BundleDetails = (props: IOwnProps) => {
    const { showModal, callback } = props;
    const [selected, setSelected] = useState<Bundle>(props.selected);

    return (
        <Dialog open={showModal} onClose={callback} maxWidth="lg" fullWidth={true}>
            <DialogTitle>BUNDLE DETAILS</DialogTitle>
            <div>
                <Grid container>
                    <Grid item xs={4} style={{ alignSelf: 'stretch' }}>
                        <BundleContents bundle={selected || props.selected} />
                    </Grid>
                    <Grid item xs={8}>
                        <BundleCardContainer
                            selected={selected || props.selected}
                            setSelected={setSelected}
                        />
                    </Grid>
                </Grid>
            </div>
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
