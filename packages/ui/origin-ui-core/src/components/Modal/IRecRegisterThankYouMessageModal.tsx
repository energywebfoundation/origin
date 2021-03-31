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
import { useLinks } from '../../utils';

interface IProps {
    showModal?: boolean;
    setShowModal?: (showModal: boolean) => void;
}

export const IRecRegisterThankYouMessageModal = ({
    showModal,
    setShowModal
}: IProps): JSX.Element => {
    const history = useHistory();
    const { t } = useTranslation();
    const { getDefaultLink } = useLinks();

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

    return (
        <Dialog open={showModal} onClose={() => closeModal()} maxWidth={'sm'} fullWidth={true}>
            <DialogTitle>
                <Grid container>
                    <Grid item xs>
                        <Box px={3} mt={4} className={classes.modalTitle}>
                            {t('general.info.registerThankYouModalTitle')}
                            <Box fontSize={fontSizeMd} mt={3} className={classes.modalContent}>
                                {t('general.info.IRecRegisterThankYouModalContent')}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogActions>
                <Box p={2}>
                    <Button variant="contained" color="primary" onClick={() => closeModal()}>
                        {t('general.responses.ok')}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};
