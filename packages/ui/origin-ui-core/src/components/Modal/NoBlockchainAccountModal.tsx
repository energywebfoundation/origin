import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    Grid
} from '@material-ui/core';
import { fromGeneralActions, fromGeneralSelectors } from '../../features';

export function NoBlockchainAccountModal() {
    const visibility = useSelector(fromGeneralSelectors.getNoAccountModalVisibility);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const handleClose = () => dispatch(fromGeneralActions.setNoAccountModalVisibility(false));

    return (
        <Dialog open={visibility} onClose={handleClose}>
            <DialogTitle>{t('general.feedback.noBlockchainAccount')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            {`1. ${t('general.info.noBlockchainAccount1')}`}
                        </Grid>
                        <Grid item xs={12}>
                            {`2. ${t('general.info.noBlockchainAccount2')}`}
                        </Grid>
                    </Grid>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={handleClose}>
                    {t('general.actions.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
