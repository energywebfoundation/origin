import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DeleteOutline, PermIdentityOutlined } from '@material-ui/icons';
import {
    IUser,
    getRolesFromRights,
    isRole,
    Role,
    UserStatus
} from '@energyweb/origin-backend-core';
import { fromGeneralActions, fromGeneralSelectors } from '../../features';
import { showNotification, NotificationTypeEnum, roleNames } from '../../utils';
import {
    TableMaterial,
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from '../Table';
import { IRecord } from '../admin/AdminUsersTable';
import { ChangeRoleModal } from '../Modal';
import { fromUsersSelectors } from '../../features';

export function OrganizationUsersTable() {
    const { t } = useTranslation();

    const organizationClient = useSelector(fromGeneralSelectors.getBackendClient)
        ?.organizationClient;
    const userOffchain = useSelector(fromUsersSelectors.getUserOffchain);
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
                    NotificationTypeEnum.Error
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
                NotificationTypeEnum.Error
            );
            return;
        }

        dispatch(fromGeneralActions.setLoading(true));

        try {
            await organizationClient.removeMember(userOffchain.organization.id, user.id);

            showNotification(`User removed.`, NotificationTypeEnum.Success);

            await loadPage(1);
        } catch (error) {
            showNotification(`Could not remove user.`, NotificationTypeEnum.Error);
            console.error(error);
        }

        dispatch(fromGeneralActions.setLoading(false));
    }

    async function changeRole(rowIndex: number) {
        const user = paginatedData[rowIndex]?.user;

        if (!isRole(userOffchain, Role.OrganizationAdmin)) {
            showNotification(`Only the Admin can change user roles.`, NotificationTypeEnum.Error);
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
                icon: <DeleteOutline data-cy="remove-user-icon" />,
                name: 'Remove',
                onClick: (index: string) => remove(parseInt(index, 10))
            },
            {
                icon: <PermIdentityOutlined data-cy="edit-user-icon" />,
                name: 'Edit Role',
                onClick: (index: string) => changeRole(parseInt(index, 10))
            }
        );
    }

    const columns = [
        { id: 'firstName', label: t('user.properties.firstName') },
        { id: 'lastName', label: t('user.properties.lastName') },
        { id: 'email', label: t('user.properties.email') },
        { id: 'role', label: t('user.properties.role') }
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
        <div data-cy="organization-members-page">
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
        </div>
    );
}
