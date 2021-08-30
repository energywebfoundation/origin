import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Dialog, DialogTitle, DialogActions, Button, Box, useTheme, Grid } from '@material-ui/core';
import DraftOutlineIcon from '@material-ui/icons/DraftsOutlined';
import {
    OrganizationInvitationStatus,
    IOrganizationInvitation
} from '@energyweb/origin-backend-core';
import { roleNames } from '../../utils/organizationRoles';
import { showNotification, NotificationTypeEnum } from '../../utils/notifications';
import { fromGeneralActions, fromGeneralSelectors, fromUsersActions } from '../../features';
import { useLinks } from '../../hooks';

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
    const invitationClient = useSelector(fromGeneralSelectors.getBackendClient)?.invitationClient;
    const { t } = useTranslation();
    const {
        typography: { fontSizeSm }
    } = useTheme();
    const history = useHistory();
    const { defaultPageUrl } = useLinks();

    const reject = async () => {
        dispatch(fromGeneralActions.setLoading(true));

        try {
            await invitationClient.updateInvitation(
                invitation.id.toString(),
                OrganizationInvitationStatus.Rejected
            );

            showNotification(
                t('organization.invitations.notification.rejectedSuccess'),
                NotificationTypeEnum.Success
            );
        } catch (error) {
            showNotification(
                t('organization.invitations.notification.rejectedFailure'),
                NotificationTypeEnum.Error
            );
            console.error(error);
        }
        dispatch(
            fromUsersActions.setInvitations(
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
        dispatch(fromGeneralActions.setLoading(false));
    };

    const accept = async () => {
        dispatch(fromGeneralActions.setLoading(true));

        try {
            await invitationClient.updateInvitation(
                invitation.id.toString(),
                OrganizationInvitationStatus.Accepted
            );
            invitations
                .filter((inv) => inv.id !== invitation.id)
                .forEach((inv) =>
                    invitationClient.updateInvitation(
                        inv.id.toString(),
                        OrganizationInvitationStatus.Rejected
                    )
                );
            showNotification(
                t('organization.invitations.notification.acceptedSuccess'),
                NotificationTypeEnum.Success
            );
            dispatch(fromUsersActions.refreshUserOffchain());
            setShowModal(false);
            history.push(defaultPageUrl);
        } catch (error) {
            showNotification(
                t('organization.invitations.notification.acceptedFailure'),
                NotificationTypeEnum.Error
            );
            console.error(error);
        }

        dispatch(fromGeneralActions.setLoading(false));
    };

    const later = async () => {
        dispatch(fromGeneralActions.setLoading(true));

        try {
            await invitationClient.updateInvitation(
                invitation.id.toString(),
                OrganizationInvitationStatus.Viewed
            );
            showNotification(
                t('organization.invitations.notification.laterSuccess'),
                NotificationTypeEnum.Success
            );
        } catch (error) {
            showNotification(
                t('organization.invitations.notification.laterFailure'),
                NotificationTypeEnum.Error
            );
            console.error(error);
        }
        dispatch(
            fromUsersActions.setInvitations(
                invitations.map((inv) =>
                    inv.id === invitation.id
                        ? { ...invitation, status: OrganizationInvitationStatus.Viewed }
                        : inv
                )
            )
        );
        setShowModal(false);
        dispatch(fromGeneralActions.setLoading(false));
    };

    return (
        <Dialog open={showModal}>
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
                                        role: t(
                                            roleNames.filter((roleObj) => roleObj.value === role)[0]
                                                ?.label
                                        ),
                                        orgName: name
                                    }}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogActions>
                <Button
                    data-cy="invitations-later-button"
                    variant="outlined"
                    color="primary"
                    onClick={() => later()}
                >
                    {t('organization.invitations.actions.later')}
                </Button>
                <Button
                    data-cy="invitations-decline-button"
                    variant="outlined"
                    color="primary"
                    onClick={() => reject()}
                >
                    {t('organization.invitations.actions.decline')}
                </Button>
                <Button
                    data-cy="invitations-accept-button"
                    variant="contained"
                    color="primary"
                    onClick={() => accept()}
                >
                    {t('organization.invitations.actions.accept')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
