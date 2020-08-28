import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogActions, Button, Box, Grid } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { getUserOffchain } from '../../features/users/selectors';
import { useTranslation, useLinks } from '../..';
import { Trans } from 'react-i18next';
import DraftOutlineIcon from '@material-ui/icons/DraftsOutlined';
import { useHistory } from 'react-router-dom';

export const FIRST_LOGIN_STORAGE_KEY = 'FIRST LOGIN';

export const LoginNoInvitationsModal = () => {
    const user = useSelector(getUserOffchain);
    const [showModal, setShowModal] = useState(false);
    const history = useHistory();
    const { t } = useTranslation();
    const { getOrganizationRegisterLink, getCertificatesLink } = useLinks();

    useEffect(() => {
        const firstLoginItem = localStorage.getItem(FIRST_LOGIN_STORAGE_KEY);
        if (user && !firstLoginItem) {
            localStorage.setItem(FIRST_LOGIN_STORAGE_KEY, 'true');
            setShowModal(true);
        }
    }, [user]);

    const notNow = async () => {
        setShowModal(false);
        history.push(getCertificatesLink());
    };

    const registerOrganization = async () => {
        setShowModal(false);
        history.push(getOrganizationRegisterLink());
    };

    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md">
            <DialogTitle>
                <Grid container>
                    <Grid item xs={2}>
                        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                            <DraftOutlineIcon
                                color="primary"
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
                                {t('organization.registration.loginNoInvitationsModalTitle')}
                            </Box>
                            <br />
                            <br />
                            <Box style={{ fontSize: '70%', fontWeight: 'lighter' }}>
                                <Trans i18nKey="organization.registration.loginNoInvitationsModalContent" />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogActions>
                <Button variant="outlined" color="primary" onClick={() => notNow()}>
                    {t('organization.registration.actions.notNow')}
                </Button>
                <Button variant="contained" color="primary" onClick={() => registerOrganization()}>
                    {t('organization.registration.actions.registerOrganization')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
