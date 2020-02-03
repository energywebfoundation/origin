import React, { useEffect } from 'react';
import { showNotification, NotificationType } from '../../utils/notifications';
import { useSelector, useDispatch } from 'react-redux';
import { TableMaterial } from '../Table/TableMaterial';
import { DeleteOutline } from '@material-ui/icons';
import { getUserOffchain } from '../../features/users/selectors';
import { setLoading } from '../../features/general/actions';
import { getOffChainDataSource } from '../../features/general/selectors';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from '../Table/PaginatedLoaderHooks';
import { IUser } from '@energyweb/origin-backend-core';

interface IRecord {
    user: IUser;
}

export function OrganizationUsersTable() {
    const organizationClient = useSelector(getOffChainDataSource)?.organizationClient;
    const userOffchain = useSelector(getUserOffchain);

    const dispatch = useDispatch();

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

        const entities = await organizationClient.getMembers(userOffchain.organization.id);

        let newPaginatedData: IRecord[] = entities.map(i => ({
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

    const actions = [
        {
            icon: <DeleteOutline />,
            name: 'Remove',
            onClick: (row: number) => remove(row)
        }
    ];

    const columns = [
        { id: 'firstName', label: 'First name' },
        { id: 'lastName', label: 'Last name' },
        { id: 'email', label: 'Email' }
    ] as const;

    const rows = paginatedData.map(({ user }) => {
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };
    });

    return (
        <TableMaterial
            columns={columns}
            rows={rows}
            loadPage={loadPage}
            total={total}
            pageSize={pageSize}
            actions={actions}
        />
    );
}
