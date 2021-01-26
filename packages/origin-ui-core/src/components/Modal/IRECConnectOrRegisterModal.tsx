import React, { useContext } from 'react';
import { Dialog, DialogTitle, DialogActions, Grid, Box, Button, useTheme } from '@material-ui/core';
import OrgAddedIcon from '../../../assets/icon-org-added.svg';
import { useTranslation } from '../..';
import { useLinks } from '../../utils';
import { useSelector } from 'react-redux';
import { getUserOffchain } from '../../features/users/selectors';
import { useHistory } from 'react-router-dom';
import { OriginConfigurationContext } from '..';
import { OriginFeature } from '@energyweb/utils-general';
import { getBlockchainAccount } from '../../utils/user';

interface IProps {
    showModal: boolean;
    setShowModal: (showModal: boolean) => void;
    setShowBlockchainModal?: (showModal: boolean) => void;
}

export enum STEP_NAMES {
    NOT_NOW = 0,
    CONNECT_IREC = 1,
    REGISTER_IREC = 2
}

export const IRECConnectOrRegisterModal = ({
    showModal,
    setShowModal,
    setShowBlockchainModal
}: IProps) => {
    const { t } = useTranslation();
    const {
        typography: { fontSizeMd }
    } = useTheme();
    const { getOrganizationIRecRegisterLink, getOrganizationViewLink } = useLinks();
    const user = useSelector(getUserOffchain);
    const orgId = user.organization?.id;
    const history = useHistory();
    const { enabledFeatures } = useContext(OriginConfigurationContext);

    const onClose = (step) => {
        setShowModal(false);
        switch (step) {
            case STEP_NAMES.NOT_NOW:
                if (!getBlockchainAccount(user)) {
                    setShowBlockchainModal(true);
                } else {
                    history.push(getOrganizationViewLink(orgId.toString()));
                }
                break;
            case STEP_NAMES.REGISTER_IREC:
                history.push(getOrganizationIRecRegisterLink());
                break;
        }
    };

    return (
        <Dialog open={showModal} onClose={() => onClose(0)} maxWidth={'md'} fullWidth={true}>
            <DialogTitle>
                <Grid item container>
                    <Grid item xs={2}>
                        <Box>
                            <img
                                src={OrgAddedIcon}
                                style={{
                                    width: '80%',
                                    height: '80%',
                                    position: 'relative',
                                    top: 0
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={9}>
                        <Box>{t('organization.registration.titleConnectOrRegisterIREC')}</Box>
                        <br />
                        <Box fontSize={fontSizeMd}>
                            {t('organization.registration.checkingInfoToApprove')}
                        </Box>
                        <Box fontSize={fontSizeMd} mt={2}>
                            {t('organization.registration.contentConnectOrRegisterIREC')}
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogActions>
                <Grid item container justify="flex-end" spacing={2}>
                    <Grid item>
                        <Button variant="outlined" color="primary" onClick={() => onClose(0)}>
                            {t('organization.registration.actions.notNow')}
                        </Button>
                    </Grid>
                    {enabledFeatures.includes(OriginFeature.IRecConnect) && (
                        <Grid item>
                            <Button variant="contained" color="primary" onClick={() => onClose(1)}>
                                {t('organization.registration.actions.connectIREC')}
                            </Button>
                        </Grid>
                    )}
                    <Grid item>
                        <Button variant="contained" color="primary" onClick={() => onClose(2)}>
                            {t('organization.registration.actions.registerIREC')}
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
};
