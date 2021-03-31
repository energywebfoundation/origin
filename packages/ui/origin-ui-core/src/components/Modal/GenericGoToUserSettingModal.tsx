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

interface IProps {
    showModal?: boolean;
    setShowModal?: (showModal: boolean) => void;
    title: string;
    content: string;
    button: string;
}

export const GenericGoToUserSettingModal = ({
    showModal,
    setShowModal,
    title,
    content,
    button
}: IProps) => {
    const history = useHistory();
    const { t } = useTranslation();
    const { defaultPageUrl, userProfilePageUrl } = useLinks();

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
        history.push(defaultPageUrl);
    };

    const connectAddress = () => {
        setShowModal(false);
        history.push(userProfilePageUrl);
    };

    return (
        <Dialog open={showModal} onClose={() => closeModal()} maxWidth={'sm'} fullWidth={true}>
            <DialogTitle>
                <Grid container>
                    <Grid item xs>
                        <Box px={3} mt={4} className={classes.modalTitle}>
                            {t(title)}
                            <Box fontSize={fontSizeMd} mt={3} className={classes.modalContent}>
                                {t(content)}
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
                        {t(button)}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};
