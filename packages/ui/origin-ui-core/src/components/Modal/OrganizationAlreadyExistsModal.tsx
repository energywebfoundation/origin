import React from 'react';
import { Dialog, DialogTitle, DialogActions, Button, Box, useTheme, Grid } from '@material-ui/core';
import { useTranslation } from '../..';
import iconAdded from '../../../assets/icon-org-added.svg';

interface IProps {
    showModal?: boolean;
    setShowModal?: (showModal: boolean) => void;
}

export const OrganizationAlreadyExistsModal = ({ showModal, setShowModal }: IProps) => {
    const {
        typography: { fontSizeMd }
    } = useTheme();
    const { t } = useTranslation();

    return (
        <Dialog
            open={showModal}
            onClose={() => setShowModal(false)}
            maxWidth={'sm'}
            fullWidth={true}
        >
            <DialogTitle>
                <Grid container>
                    <Grid item xs={3}>
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
                        <Box px={3} mt={4}>
                            {t('organization.registration.organizationCouldNotBeRegistered')}
                            <Box fontSize={fontSizeMd} mt={3}>
                                {t('organization.registration.organizationAlreadyExists')}
                            </Box>
                            <Box fontSize={fontSizeMd} mt={2}>
                                {t('general.feedback.supportTeamGetInContact')}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogActions>
                <Box pr={2.5} pb={2.5}>
                    <Button variant="contained" color="primary" onClick={() => setShowModal(false)}>
                        {t('general.responses.ok')}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};
