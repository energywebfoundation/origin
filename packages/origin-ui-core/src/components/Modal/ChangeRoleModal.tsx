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
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Role, IUser, getRolesFromRights, isRole } from '@energyweb/origin-backend-core';

import { getUserOffchain } from '../../features/users/selectors';
import { roleNames } from '../Organization/Organization';
import { NotificationType, showNotification, useTranslation } from '../../utils';
import { setLoading, getBackendClient } from '../../features/general';

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

    return (
        <Dialog open={showModal} onClose={handleClose}>
            <DialogTitle>{`Change role for ${user?.firstName} ${user?.lastName}`}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth={true} variant="filled" className="mt-4">
                    <InputLabel>New Role</InputLabel>
                    <Select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as number)}
                        fullWidth
                        variant="filled"
                        input={<FilledInput />}
                    >
                        {Object.keys(roleNames).map((role) => (
                            <MenuItem key={role} value={role}>
                                {t(roleNames[role])}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={changeRole} color="primary">
                    Change
                </Button>
            </DialogActions>
        </Dialog>
    );
}
