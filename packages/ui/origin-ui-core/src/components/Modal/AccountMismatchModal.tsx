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
import { getAccountMismatchModalProperties } from '../../features/general/selectors';
import {
    setAccountMismatchModalPropertiesAction,
    accountMismatchModalResolvedAction
} from '../../features/general/actions';
import { getUserOffchain, getActiveBlockchainAccountAddress } from '../../features/users/selectors';
import { useTranslation } from '../../utils';

export function AccountMismatchModal() {
    const { visibility } = useSelector(getAccountMismatchModalProperties);
    const user = useSelector(getUserOffchain);
    const activeBlockchainAddress = useSelector(getActiveBlockchainAccountAddress);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const handleClose = () =>
        dispatch(
            setAccountMismatchModalPropertiesAction({
                visibility: false
            })
        );

    const submit = () => {
        dispatch(accountMismatchModalResolvedAction(true));
        handleClose();
    };

    const cancel = () => {
        dispatch(accountMismatchModalResolvedAction(false));
        handleClose();
    };

    return (
        <Dialog open={visibility} onClose={handleClose}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
            >
                <DialogTitle>{t('general.feedback.blockchainAccountMismatch')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('general.info.tryingToSignAndBoundIs')}
                        <br />
                        <br />
                        {user?.blockchainAccountAddress?.toLowerCase()}
                        <br />
                        <br />
                        {t('general.info.andYouAreTrying')}
                        <br />
                        <br />
                        {activeBlockchainAddress?.toLowerCase()}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={cancel}>
                        {t('general.actions.cancel')}
                    </Button>
                    <Button color="primary" type="submit">
                        {t('general.actions.continue')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
