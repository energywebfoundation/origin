import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogTitle,
    DialogActions,
    Button,
    Box,
    useTheme,
    Grid,
    makeStyles,
    createStyles
} from '@material-ui/core';
import { useLinks } from '../../hooks';
import {
    useOrgModalsStore,
    useOrgModalsDispatch,
    OrganizationModalsActionsEnum
} from '../../context';

const useStyles = makeStyles(() =>
    createStyles({
        maybeButton: {
            marginRight: '1rem'
        },
        modalContent: {
            fontSize: '16px'
        },
        modalTitle: {
            fontSize: '24px'
        }
    })
);

export const RegisterThankYouMessageModal = (): JSX.Element => {
    const history = useHistory();
    const { t } = useTranslation();
    const { defaultPageUrl } = useLinks();

    const {
        typography: { fontSizeMd }
    } = useTheme();

    const { registerThankYou: open } = useOrgModalsStore();
    const dispatchModals = useOrgModalsDispatch();

    const closeModal = () => {
        dispatchModals({
            type: OrganizationModalsActionsEnum.SHOW_REGISTER_THANK_YOU,
            payload: false
        });
        history.push(defaultPageUrl);
    };

    const classes = useStyles(useTheme());

    return (
        <Dialog open={open} onClose={closeModal} maxWidth={'sm'} fullWidth={true}>
            <DialogTitle>
                <Grid container>
                    <Grid item xs>
                        <Box px={3} mt={4} className={classes.modalTitle}>
                            {t('general.info.registerThankYouModalTitle')}
                            <Box fontSize={fontSizeMd} mt={3} className={classes.modalContent}>
                                {t('general.info.registerThankYouModalContent')}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogActions>
                <Box p={2}>
                    <Button variant="contained" color="primary" onClick={closeModal}>
                        {t('general.responses.ok')}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};
