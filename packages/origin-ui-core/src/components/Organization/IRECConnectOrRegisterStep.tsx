import React from 'react';
import { Paper, Grid, Box, Button, Theme, useTheme } from '@material-ui/core';
import { STEP_NAMES } from './OrganizationRegistrationStepper';
import OrgAddedIcon from '../../../assets/icon-org-added.svg';
import { useTranslation } from '../..';
import { Trans } from 'react-i18next';
import { useLinks } from '../../utils';
import { useSelector } from 'react-redux';
import { getUserOffchain } from '../../features/users/selectors';
import { useHistory } from 'react-router-dom';

interface IProps {
    nextStep: (step: STEP_NAMES) => void;
}

export const IRECConnectOrRegisterStep = (props: IProps) => {
    const { nextStep } = props;
    const { t } = useTranslation();
    const { spacing }: Theme = useTheme();
    const { getOrganizationViewLink } = useLinks();
    const orgId = useSelector(getUserOffchain)?.organization?.id;
    const history = useHistory();

    return (
        <Paper elevation={1} style={{ padding: spacing(2) }}>
            <Grid container direction="column">
                <Grid item container>
                    <Grid item xs={3}>
                        <img src={OrgAddedIcon} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    </Grid>
                    <Grid item xs={9}>
                        <Box fontWeight="fontWeightBold">
                            {t('organization.registration.titleConnectOrRegisterIREC')}
                        </Box>
                        <br />
                        <Box style={{ fontWeight: 'lighter' }}>
                            <Trans i18nKey="organization.registration.contentConnectOrRegisterIREC">
                                We are checking your information as soon as possible and will
                                contact you once everything is approved and you can start trading.
                                <br /> <br /> In order to register devices and request I-RECs, also
                                need to connect to existing I-REC account
                            </Trans>
                        </Box>
                    </Grid>
                </Grid>
                <Grid item container justify="flex-end" spacing={2}>
                    <Grid item>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => history.push(getOrganizationViewLink(orgId.toString()))}
                        >
                            {t('organization.registration.actions.notNow')}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => nextStep(STEP_NAMES.CONNECT_IREC)}
                        >
                            {t('organization.registration.actions.connectIREC')}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => nextStep(STEP_NAMES.REGISTER_IREC)}
                        >
                            {t('organization.registration.actions.registerIREC')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Paper>
    );
};
