import React from 'react';
import { Dialog, DialogTitle, DialogActions, Button, Box, useTheme, Grid } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import {
    OrganizationInvitationStatus,
    Role,
    IOrganizationInvitation
} from '@energyweb/origin-backend-core';
import { setInvitations, refreshUserOffchain } from '../../features/users/actions';
import { getOffChainDataSource, showNotification, NotificationType, useTranslation } from '../..';
import { setLoading } from '../../features/general';
import { Trans } from 'react-i18next';
import DraftOutlineIcon from '@material-ui/icons/DraftsOutlined';

interface IProps {
    showModal: boolean;
    setShowModal: (showModal: boolean) => void;
    invitations: IOrganizationInvitation[];
}

export const PendingInvitationsModal = (props: IProps) => {
    const { showModal, setShowModal, invitations } = props;
    const invitation =
        invitations.length > 0
            ? invitations.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[
                  invitations.length - 1
              ]
            : null;
    const {
        sender: admin,
        role,
        organization: { name }
    } = invitation || {
        sender: '',
        role: '',
        organization: { name: '' }
    };

    const dispatch = useDispatch();
    const organizationClient = useSelector(getOffChainDataSource)?.organizationClient;
    const { t } = useTranslation();
    const {
        typography: { fontSizeSm }
    } = useTheme();

    const reject = async () => {
        dispatch(setLoading(true));

        try {
            await organizationClient.rejectInvitation(invitation.id);

            showNotification(
                t('organization.invitations.notification.rejectedSuccess'),
                NotificationType.Success
            );
        } catch (error) {
            showNotification(
                t('organization.invitations.notification.rejectedFailure'),
                NotificationType.Error
            );
            console.error(error);
        }
        dispatch(
            setInvitations(
                invitations.map((inv) =>
                    inv.id === invitation.id
                        ? {
                              ...invitation,
                              status: OrganizationInvitationStatus.Rejected
                          }
                        : inv
                )
            )
        );
        setShowModal(false);
        dispatch(setLoading(false));
    };

    const accept = async () => {
        dispatch(setLoading(true));

        try {
            await organizationClient.acceptInvitation(invitation.id);
            invitations
                .filter((inv) => inv.id !== invitation.id)
                .forEach((inv) => organizationClient.rejectInvitation(inv.id));
            showNotification(
                t('organization.invitations.notification.acceptedSuccess'),
                NotificationType.Success
            );
        } catch (error) {
            showNotification(
                t('organization.invitations.notification.accesptedFailure'),
                NotificationType.Error
            );
            console.error(error);
        }
        dispatch(refreshUserOffchain());
        setShowModal(false);
        dispatch(setLoading(false));
    };

    const later = async () => {
        dispatch(setLoading(true));

        try {
            await organizationClient.viewInvitation(invitation.id);
            showNotification(
                t('organization.invitations.notification.laterSuccess'),
                NotificationType.Success
            );
        } catch (error) {
            showNotification(
                t('organization.invitations.notification.laterFailure'),
                NotificationType.Error
            );
            console.error(error);
        }
        dispatch(
            setInvitations(
                invitations.map((inv) =>
                    inv.id === invitation.id
                        ? { ...invitation, status: OrganizationInvitationStatus.Viewed }
                        : inv
                )
            )
        );
        setShowModal(false);
        dispatch(setLoading(false));
    };

    return (
        <Dialog open={showModal} onClose={() => setShowModal(false)}>
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
                            {t('organization.invitations.dialog.invitationsModalTitle')}
                            <br />
                            <br />
                            <Box fontSize={fontSizeSm}>
                                <Trans
                                    i18nKey="organization.invitations.dialog.invitationMessage"
                                    values={{
                                        admin,
                                        role: Role[role],
                                        orgName: name
                                    }}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogActions>
                <Button variant="outlined" color="primary" onClick={() => later()}>
                    {t('organization.invitations.actions.later')}
                </Button>
                <Button variant="outlined" color="primary" onClick={() => reject()}>
                    {t('organization.invitations.actions.decline')}
                </Button>
                <Button variant="contained" color="primary" onClick={() => accept()}>
                    {t('organization.invitations.actions.accept')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
