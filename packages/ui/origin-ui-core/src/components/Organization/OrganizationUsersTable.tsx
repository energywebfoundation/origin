import React, { useEffect, useState } from 'react';
import { showNotification, NotificationType } from '../../utils/notifications';
import { useSelector, useDispatch } from 'react-redux';
import { TableMaterial } from '../Table/TableMaterial';
import { DeleteOutline, PermIdentityOutlined } from '@material-ui/icons';
import { getUserOffchain } from '../../features/users/selectors';
import { setLoading } from '../../features/general/actions';
import { getBackendClient } from '../../features/general/selectors';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from '../Table/PaginatedLoaderHooks';
import {
    IUser,
    getRolesFromRights,
    isRole,
    Role,
    UserStatus
} from '@energyweb/origin-backend-core';
import { useTranslation, roleNames } from '../../utils';
import { ChangeRoleModal } from '../Modal/ChangeRoleModal';
import { IRecord } from '../admin/AdminUsersTable';

export function OrganizationUsersTable() {
    const { t } = useTranslation();

    const organizationClient = useSelector(getBackendClient)?.organizationClient;
    const userOffchain = useSelector(getUserOffchain);
    const userIsActive = userOffchain && userOffchain.status === UserStatus.Active;

    const dispatch = useDispatch();

    const [selectedUser, setSelectedUser] = useState<IUser>(null);
    const [showUserRoleChangeModal, setShowUserRoleChangeModal] = useState(false);

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        if (!userOffchain?.organization) {
            return {
                paginatedData: [],
                total: 0
            };
        }
        let entities = [];
        try {
            entities = (await organizationClient.getUsers(userOffchain.organization.id)).data;
        } catch (error) {
            const _error = { ...error };
            if (_error.response.status === 412) {
                showNotification(
                    `Only active users can perform this action. Your status is ${userOffchain.status}`,
                    NotificationType.Error
                );
            }
        }

        let newPaginatedData: IRecord[] = entities.map((i) => ({
            user: i
        }));

        const newTotal = newPaginatedData.length;

        newPaginatedData = newPaginatedData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData: newPaginatedData,
            total: newTotal
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoader<IRecord>({
        getPaginatedData
    });

    useEffect(() => {
        loadPage(1);
    }, [userOffchain, organizationClient]);

    async function remove(rowIndex: number) {
        const user = paginatedData[rowIndex]?.user;

        if (user.id === userOffchain.id) {
            showNotification(
                `You can't remove yourself from organization.`,
                NotificationType.Error
            );
            return;
        }

        dispatch(setLoading(true));

        try {
            await organizationClient.removeMember(userOffchain.organization.id, user.id);

            showNotification(`User removed.`, NotificationType.Success);

            await loadPage(1);
        } catch (error) {
            showNotification(`Could not remove user.`, NotificationType.Error);
            console.error(error);
        }

        dispatch(setLoading(false));
    }

    async function changeRole(rowIndex: number) {
        const user = paginatedData[rowIndex]?.user;

        if (!isRole(userOffchain, Role.OrganizationAdmin)) {
            showNotification(`Only the Admin can change user roles.`, NotificationType.Error);
            return;
        }

        setSelectedUser(user);
        setShowUserRoleChangeModal(true);
    }

    async function changeRoleCallback() {
        setShowUserRoleChangeModal(false);
        await loadPage(1);
    }

    const actions = [];

    if (userIsActive) {
        actions.push(
            {
                icon: <DeleteOutline />,
                name: 'Remove',
                onClick: (index: string) => remove(parseInt(index, 10))
            },
            {
                icon: <PermIdentityOutlined />,
                name: 'Edit Role',
                onClick: (index: string) => changeRole(parseInt(index, 10))
            }
        );
    }

    const columns = [
        { id: 'firstName', label: 'First name' },
        { id: 'lastName', label: 'Last name' },
        { id: 'email', label: 'Email' },
        { id: 'role', label: 'Role' }
    ];

    const rows = paginatedData.map(({ user }) => {
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: getRolesFromRights(user.rights)
                .map((role) => t(roleNames.filter((roleName) => roleName.value === role)[0].label))
                .join(', ')
        };
    });

    return (
        <>
            <TableMaterial
                columns={columns}
                rows={rows}
                loadPage={loadPage}
                total={total}
                pageSize={pageSize}
                actions={actions}
            />

            <ChangeRoleModal
                user={selectedUser}
                showModal={showUserRoleChangeModal}
                callback={changeRoleCallback}
            />
        </>
    );
}
