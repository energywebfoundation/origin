import React from 'react';
import { useHistory } from 'react-router-dom';
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
import { useTranslation, useLinks } from '../..';

interface IProps {
    showModal?: boolean;
    setShowModal?: (showModal: boolean) => void;
}

export const ConnectBlockchainAccountModal = ({ showModal, setShowModal }: IProps) => {
    const history = useHistory();
    const { t } = useTranslation();
    const { getDefaultLink, getUserProfileLink } = useLinks();

    const {
        typography: { fontSizeMd }
    } = useTheme();

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
    const classes = useStyles(useTheme());

    const closeModal = () => {
        setShowModal(false);
        history.push(getDefaultLink());
    };

    const connectAddress = () => {
        setShowModal(false);
        history.push(getUserProfileLink());
    };

    return (
        <Dialog open={showModal} onClose={() => closeModal()} maxWidth={'sm'} fullWidth={true}>
            <DialogTitle>
                <Grid container>
                    <Grid item xs>
                        <Box px={3} mt={4} className={classes.modalTitle}>
                            {t('general.info.connectBlockchainTitle')}
                            <Box fontSize={fontSizeMd} mt={3} className={classes.modalContent}>
                                {t('general.info.connectBlockchainContent')}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogActions>
                <Box p={2}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => closeModal()}
                        className={classes.maybeButton}
                    >
                        {t('general.actions.maybeLater')}
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => connectAddress()}>
                        {t('general.actions.connectBlockchainAcc')}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};
