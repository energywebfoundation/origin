import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    TextField
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { hideRequestPasswordModal } from '../../features/general/actions';
import {
    getRequestPasswordModalVisible,
    getRequestPasswordModalCallback,
    getRequestPasswordModalTitle
} from '../../features/general/selectors';

export function RequestPasswordModal() {
    const show = useSelector(getRequestPasswordModalVisible);
    const callback = useSelector(getRequestPasswordModalCallback);
    const title = useSelector(getRequestPasswordModalTitle);
    const dispatch = useDispatch();

    const handleClose = () => dispatch(hideRequestPasswordModal());

    const [password, setPassword] = useState('');

    const submit = () => {
        callback(password);
        handleClose();
    };

    return (
        <Dialog open={show} onClose={handleClose}>
            <form
                onSubmit={e => {
                    e.preventDefault();
                    submit();
                }}
            >
                <DialogTitle>{title || 'Password requested'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>Please provide a password</DialogContentText>
                    <TextField
                        label="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        fullWidth
                        className="my-3"
                        autoFocus
                        type="password"
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" type="submit">
                        Submit
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
