import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogActions, Button, Box, useTheme, Grid } from '@material-ui/core';
import iconAdded from '../../../assets/icon-org-added.svg';

export const IRecInfoSuccessModal = () => {
    const [isOpen, setIsOpen] = useState(true);
    const history = useHistory();

    const showModal = isOpen;

    const {
        typography: { fontSizeMd, fontSizeLg }
    } = useTheme();
    const { t } = useTranslation();

    const closeModal = () => {
        setIsOpen(false);
        history.push('/');
    };

    return (
        <Dialog open={showModal} onClose={() => closeModal()}>
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
                        <Box pl={2} mt={4} fontSize={fontSizeLg}>
                            {t('organization.registration.titleIRecInfoSuccess')}
                            <Box fontSize={fontSizeMd} mt={3}>
                                {t('organization.registration.contentIRecInfoSuccess')}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogActions>
                <Box pr={2.5} pb={2.5}>
                    <Button variant="contained" color="primary" onClick={() => closeModal()}>
                        {t('general.responses.ok')}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};
