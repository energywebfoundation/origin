import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogTitle, DialogActions, Grid, Box, Button, useTheme } from '@material-ui/core';
import { OriginFeature } from '@energyweb/utils-general';
import { OriginConfigurationContext } from '../../PackageConfigurationProvider';
import OrgAddedIcon from '../../../assets/icon-org-added.svg';
import { fromUsersSelectors } from '../../features';
import { useLinks } from '../../hooks';
import {
    useOrgModalsStore,
    useOrgModalsDispatch,
    OrganizationModalsActionsEnum
} from '../../context';

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

export const IRECConnectOrRegisterModal = () => {
    const { t } = useTranslation();
    const {
        typography: { fontSizeMd }
    } = useTheme();

    const { organizationIRecRegisterUrl, getOrganizationDetailsPageUrl } = useLinks();
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const orgId = user.organization?.id;

    const history = useHistory();
    const { enabledFeatures } = useContext(OriginConfigurationContext);

    const { iRecConnectOrRegister: open } = useOrgModalsStore();
    const dispatchModals = useOrgModalsDispatch();

    const onClose = (step) => {
        dispatchModals({
            type: OrganizationModalsActionsEnum.SHOW_IREC_CONNECT_OR_REGISTER,
            payload: false
        });

        switch (step) {
            case STEP_NAMES.NOT_NOW:
                if (!user?.blockchainAccountAddress) {
                    dispatchModals({
                        type: OrganizationModalsActionsEnum.SHOW_REGISTER_THANK_YOU,
                        payload: true
                    });
                } else {
                    history.push(getOrganizationDetailsPageUrl(String(orgId)));
                }
                break;
            case STEP_NAMES.REGISTER_IREC:
                history.push(organizationIRecRegisterUrl);
                break;
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose(0)} maxWidth={'md'} fullWidth={true}>
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
