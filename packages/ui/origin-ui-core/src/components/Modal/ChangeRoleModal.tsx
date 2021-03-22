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
import { Role, IUser, getRolesFromRights, isRole } from '@energyweb/origin-backend-core';
import { getUserOffchain } from '../../features/users';
import { setLoading, getBackendClient } from '../../features/general';
import { NotificationType, showNotification } from '../../utils/notifications';
import { roleNames } from '../../utils/organizationRoles';

interface IProps {
    user: IUser;
    showModal: boolean;
    callback: () => void;
}

export function ChangeRoleModal(props: IProps) {
    const { t } = useTranslation();

    const { user, callback, showModal } = props;

    const organizationClient = useSelector(getBackendClient)?.organizationClient;
    const userOffchain = useSelector(getUserOffchain);

    const [currentUserRole] = getRolesFromRights(user?.rights);

    const [selectedRole, setSelectedRole] = useState<Role>(null);

    const dispatch = useDispatch();

    useEffect(() => {
        setSelectedRole(currentUserRole);
    }, [currentUserRole]);

    async function handleClose() {
        callback();
    }

    async function changeRole() {
        if (!isRole(userOffchain, Role.OrganizationAdmin)) {
            showNotification(`Only the Admin can change user roles.`, NotificationType.Error);
            return;
        }

        dispatch(setLoading(true));

        try {
            await organizationClient.changeMemberRole(userOffchain.organization.id, user.id, {
                role: Number(selectedRole)
            });

            showNotification(`User role updated.`, NotificationType.Success);
        } catch (error) {
            showNotification(`There always needs to be an admin present.`, NotificationType.Error);
            console.error(error);
        }

        dispatch(setLoading(false));

        handleClose();
    }

    const buttonDisabled = currentUserRole === selectedRole;

    return (
        <Dialog open={showModal} onClose={handleClose}>
            <DialogTitle>{`Change role for ${user?.firstName} ${user?.lastName}`}</DialogTitle>
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
