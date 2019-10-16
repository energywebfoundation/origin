import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { disableAccountChangedModal } from '../../features/general/actions';
import { getAccountChangedModalVisible } from '../../features/general/selectors';

export function AccountChangedModal() {
    const show = useSelector(getAccountChangedModalVisible);
    const dispatch = useDispatch();

    const handleClose = () => dispatch(disableAccountChangedModal());
    const refreshPage = () => {
        window.location.reload();
    };

    return (
        <Dialog open={show} onClose={handleClose}>
            <DialogTitle>Account changed</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Account changed, please refresh the page in order to switch to a new account.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={refreshPage} color="primary">
                    Refresh page
                </Button>
            </DialogActions>
        </Dialog>
    );
}
