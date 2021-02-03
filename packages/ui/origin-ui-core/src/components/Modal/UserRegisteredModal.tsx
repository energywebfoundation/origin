import React from 'react';
import { Dialog, DialogTitle, DialogActions, Button, Box, Grid } from '@material-ui/core';
import { useTranslation, useLinks } from '../..';
import { Trans } from 'react-i18next';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import { useHistory } from 'react-router-dom';

interface IProps {
    showModal: boolean;
    setShowModal: (showModal: boolean) => void;
}

export const UserRegisteredModal = ({ showModal, setShowModal }: IProps) => {
    const history = useHistory();
    const { t } = useTranslation();
    const { getAccountLoginLink } = useLinks();

    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md">
            <DialogTitle>
                <Grid container>
                    <Grid item xs={2}>
                        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                            <HowToRegIcon
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0
                                }}
                            />
                        </div>
                    </Grid>
                    <Grid item xs>
                        <Box pl={2}>
                            <Box style={{ fontSize: '120%' }}>
                                {t('user.dialog.userRegisteredModalTitle')}
                            </Box>
                            <br />
                            <br />
                            <Box style={{ fontSize: '70%', fontWeight: 'lighter' }}>
                                <Trans i18nKey="user.dialog.userRegisteredModalContent" />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogActions>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => history.push(getAccountLoginLink())}
                >
                    {t('general.responses.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
