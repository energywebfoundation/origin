import React from 'react';
import { useHistory } from 'react-router-dom';
import { Dialog, DialogTitle, DialogActions, Button, Box, useTheme, Grid } from '@material-ui/core';
import { showNotification, NotificationType, useTranslation, useLinks } from '../..';
import iconAdded from '../../../assets/icon-org-added.svg';

interface IProps {
    showModal: boolean;
    setShowModal: (showModal: boolean) => void;
}

export const IRecAccountRegisteredModal = ({ showModal, setShowModal }: IProps) => {
    const history = useHistory();
    const { getOrganizationLink } = useLinks();

    const {
        typography: { fontSizeMd }
    } = useTheme();
    const { t } = useTranslation();

    const onClose = () => {
        setShowModal(false);
        history.push(getOrganizationLink());
        showNotification('Organization registered.', NotificationType.Success);
    };

    return (
        <Dialog open={showModal} onClose={() => onClose()} maxWidth={'sm'} fullWidth={true}>
            <DialogTitle>
                <Grid container>
                    <Grid item xs={2}>
                        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                            <Box>
                                <img
                                    src={iconAdded}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        top: 0
                                    }}
                                />
                            </Box>
                        </div>
                    </Grid>
                    <Grid item xs>
                        <Box pl={2} mt={4}>
                            {t('organization.registration.titleIRecAccountRegistered')}
                            <Box fontSize={fontSizeMd} mt={3}>
                                {t('organization.registration.contentIRecAccountRegistered')}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogActions>
                <Box pr={2.5} pb={2.5}>
                    <Button variant="contained" color="primary" onClick={() => onClose()}>
                        {t('general.responses.ok')}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};
