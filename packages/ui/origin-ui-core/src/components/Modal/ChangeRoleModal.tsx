import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FilledInput,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from '@material-ui/core';
import { Role, getRolesFromRights, isRole } from '@energyweb/origin-backend-core';
import { NotificationTypeEnum, showNotification } from '../../utils/notifications';
import { roleNames } from '../../utils/organizationRoles';
import { fromGeneralActions, fromGeneralSelectors, fromUsersSelectors } from '../../features';
import {
    OrganizationModalsActionsEnum,
    useOrgModalsDispatch,
    useOrgModalsStore
} from '../../context';

export function ChangeRoleModal() {
    const { t } = useTranslation();
    const {
        changeMemberOrgRole: { open, userToUpdate, reloadCallback }
    } = useOrgModalsStore();
    const dispatchModals = useOrgModalsDispatch();

    const organizationClient = useSelector(
        fromGeneralSelectors.getBackendClient
    )?.organizationClient;
    const userOffchain = useSelector(fromUsersSelectors.getUserOffchain);

    const [currentUserRole] = getRolesFromRights(userToUpdate?.rights);
    const [selectedRole, setSelectedRole] = useState<Role>(null);

    const dispatch = useDispatch();

    useEffect(() => {
        if (currentUserRole) {
            setSelectedRole(currentUserRole);
        }
    }, [currentUserRole]);

    async function handleClose() {
        dispatchModals({
            type: OrganizationModalsActionsEnum.SHOW_CHANGE_MEMBER_ORG_ROLE,
            payload: {
                open: false,
                userToUpdate: null,
                reloadCallback: null
            }
        });
    }

    async function changeRole() {
        if (!isRole(userOffchain, Role.OrganizationAdmin)) {
            showNotification(`Only the Admin can change user roles.`, NotificationTypeEnum.Error);
            return;
        }

        dispatch(fromGeneralActions.setLoading(true));

        try {
            await organizationClient.changeMemberRole(
                userOffchain.organization.id,
                userToUpdate.id,
                {
                    role: Number(selectedRole)
                }
            );
            reloadCallback();
            showNotification(`User role updated.`, NotificationTypeEnum.Success);
        } catch (error) {
            showNotification(
                `There always needs to be an admin present.`,
                NotificationTypeEnum.Error
            );
            console.error(error);
        }

        dispatch(fromGeneralActions.setLoading(false));

        handleClose();
    }

    const buttonDisabled = currentUserRole === selectedRole;

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{`Change role for ${userToUpdate?.firstName} ${userToUpdate?.lastName}`}</DialogTitle>
            <DialogContent>
                <FormControl
                    data-cy="new-role-selector"
                    fullWidth={true}
                    variant="filled"
                    className="mt-4"
                >
                    <InputLabel>{t('organization.invitations.dialog.newRole')}</InputLabel>
                    <Select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as number)}
                        fullWidth
                        variant="filled"
                        input={<FilledInput />}
                    >
                        {roleNames.map((role) => (
                            <MenuItem key={role.label} value={role.value}>
                                {t(role.label)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    {t('organization.invitations.actions.cancel')}
                </Button>
                <Button
                    data-cy="change-role-button"
                    disabled={buttonDisabled}
                    onClick={changeRole}
                    color="primary"
                >
                    {t('organization.invitations.actions.change')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
