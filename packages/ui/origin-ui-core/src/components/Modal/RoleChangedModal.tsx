import React, { useRef, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    useTheme,
    ListItemIcon,
    DialogActions,
    Button,
    Grid,
    Box
} from '@material-ui/core';
import { Brightness1 } from '@material-ui/icons';
import { Role, OrganizationInvitationStatus, isRole } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { OriginConfigurationContext } from '../../PackageConfigurationProvider';
import OrgAddedIcon from '../../../assets/icon-org-added.svg';
import { fromUsersSelectors } from '../../features';
import { useLinks } from '../../hooks';

interface IProps {
    showModal?: boolean;
    setShowModal?: (showModal: boolean) => void;
    setShowIRec?: (showModal: boolean) => void;
    setShowBlockchainModal?: (showModal: boolean) => void;
}

export const RoleChangedModal = ({
    showModal,
    setShowModal,
    setShowIRec,
    setShowBlockchainModal
}: IProps) => {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const userRef = useRef(user);
    const history = useHistory();
    const { defaultPageUrl } = useLinks();
    const { t } = useTranslation();
    const {
        typography: { fontSizeMd },
        palette: {
            text: { primary }
        }
    } = useTheme();
    const sender = useSelector(fromUsersSelectors.getInvitations).find(
        (invitation) => invitation.status === OrganizationInvitationStatus.Accepted
    )?.sender;
    const enabledFeatures = useContext(OriginConfigurationContext)?.enabledFeatures;
    const iRecEnabled = enabledFeatures?.includes(OriginFeature.IRec);

    useEffect(() => {
        if (user?.organization && userRef.current) {
            const { rights: newRole } = user;
            const { rights: oldRole, organization: oldOrganization } = userRef.current;
            if (!oldOrganization || oldRole !== newRole) {
                setShowModal(true);
            }
        }
        userRef.current = user;
    }, [user]);

    const getAsRoleYouCan = (rights: Role) => {
        switch (rights) {
            case Role.OrganizationAdmin:
                return t('user.feedback.roleChanged.asOrgAdminYouCan');
            case Role.OrganizationDeviceManager:
                return t('user.feedback.roleChanged.asDeviceManYouCan');
            case Role.OrganizationUser:
                return t('user.feedback.roleChanged.asMemberYouCan');
        }
    };

    const allowedActions = (rights: Role) => {
        let actions: string[];
        switch (rights) {
            case Role.OrganizationUser:
                actions = [
                    t('user.feedback.roleChanged.canPlaceOrder'),
                    t('user.feedback.roleChanged.canBuyCertificates', {
                        certificateType: iRecEnabled ? 'I-RECs' : 'certificates'
                    }),
                    t('user.feedback.roleChanged.canCreateAndBuyCertificateBundles', {
                        certificateType: iRecEnabled ? 'I-REC' : 'certificate'
                    }),
                    t('user.feedback.roleChanged.canRedeemCertificates', {
                        certificateType: iRecEnabled ? 'I-RECs' : 'certificates'
                    }),
                    t('user.feedback.roleChanged.canWithdrawCertificates', {
                        certificateType: iRecEnabled ? 'I-RECs' : 'certificates'
                    })
                ];
                break;
            case Role.OrganizationDeviceManager:
                actions = [
                    t('user.feedback.roleChanged.canRegisterDevices'),
                    t('user.feedback.roleChanged.canRequestIssuenceOfCertificates', {
                        certificateType: iRecEnabled ? 'I-RECs' : 'certificates'
                    }),
                    t('user.feedback.roleChanged.canConfigureAutomatedOrderCreation')
                ];
                break;
            case Role.OrganizationAdmin:
                actions = [
                    t('user.feedback.roleChanged.canAddOrRemoveOrgMembers'),
                    t('user.feedback.roleChanged.canEditUserRoles')
                ];
                if (iRecEnabled) {
                    actions.push(t('user.feedback.roleChanged.connectOrgToIRec'));
                }
                break;
            default:
                actions = [];
                break;
        }
        return actions.map((action) => action);
    };

    const closeRoleModal = () => {
        setShowModal(false);
        if (setShowIRec && iRecEnabled) {
            setShowIRec(true);
        } else if (!user.organization?.blockchainAccountAddress) {
            setShowBlockchainModal(true);
        } else {
            history.push(defaultPageUrl);
        }

        const { rights: newRole } = user;
        if (
            (!setShowIRec &&
                newRole === Role.OrganizationAdmin &&
                !user.organization?.blockchainAccountAddress) ||
            (!setShowIRec &&
                newRole === Role.OrganizationDeviceManager &&
                !user.organization?.blockchainAccountAddress)
        ) {
            setShowBlockchainModal(true);
        }
    };

    return (
        <Dialog open={showModal} onClose={() => closeRoleModal()} scroll="body">
            <DialogTitle style={{ paddingBottom: '0' }}>
                <Grid container>
                    <Grid item xs={3}>
                        <img src={OrgAddedIcon} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    </Grid>
                    <Grid item xs={9}>
                        <Box pl={2}>
                            <Trans
                                i18nKey="user.feedback.roleChanged.succesfullyJoinedOrg"
                                values={{
                                    orgName: user?.organization?.name
                                }}
                            />
                            <br />
                            <br />
                            <Box
                                fontSize={fontSizeMd}
                                fontWeight="fontWeightRegular"
                                color="text.secondary"
                            >
                                <Trans
                                    style={{ fontSize: fontSizeMd }}
                                    i18nKey={getAsRoleYouCan(user?.rights)}
                                    values={{
                                        orgName: user?.organization?.name,
                                        admin: sender || `${user?.firstName} ${user?.lastName}`
                                    }}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent style={{ paddingTop: 0 }}>
                <Grid container>
                    <Grid item xs={3} />
                    <Grid item xs={9}>
                        <Box color="text.secondary" fontSize={fontSizeMd}>
                            <List dense style={{ paddingTop: 0 }}>
                                {allowedActions(user?.rights).map((action) => (
                                    <ListItem key={action}>
                                        <ListItemIcon style={{ minWidth: 20 }}>
                                            <Brightness1 style={{ fontSize: 7, color: primary }} />
                                        </ListItemIcon>
                                        <ListItemText>{action}</ListItemText>
                                    </ListItem>
                                ))}
                            </List>
                            <br />
                            <br />
                            {isRole(user, Role.OrganizationAdmin) && (
                                <div>
                                    {t('user.feedback.roleChanged.asDeviceManagerYouCanAlso')}
                                    <List dense>
                                        {allowedActions(Role.OrganizationDeviceManager).map(
                                            (action) => (
                                                <ListItem key={action}>
                                                    <ListItemIcon style={{ minWidth: 20 }}>
                                                        <Brightness1
                                                            style={{ fontSize: 7, color: primary }}
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText>{t(action)}</ListItemText>
                                                </ListItem>
                                            )
                                        )}
                                    </List>
                                    <br />
                                    <br />
                                </div>
                            )}
                            {isRole(
                                user,
                                Role.OrganizationAdmin,
                                Role.OrganizationDeviceManager
                            ) && (
                                <div>
                                    {t('user.feedback.roleChanged.asAMemberYouCanAlso')}
                                    <List dense>
                                        {allowedActions(Role.OrganizationUser).map((action) => (
                                            <ListItem key={action}>
                                                <ListItemIcon style={{ minWidth: 20 }}>
                                                    <Brightness1
                                                        style={{ fontSize: 7, color: primary }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText>{t(action)}</ListItemText>
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button color="primary" variant="contained" onClick={() => closeRoleModal()}>
                    {t('general.responses.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
