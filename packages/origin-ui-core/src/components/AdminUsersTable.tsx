import { IUser, IOrganization } from '@energyweb/origin-backend-core';
import { Edit } from '@material-ui/icons';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getOffChainDataSource } from '../features/general/selectors';
import { getUserOffchain } from '../features/users/selectors';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from './Table/PaginatedLoaderHooks';
import { TableMaterial } from './Table/TableMaterial';
import { useHistory } from 'react-router-dom';

interface IRecord {
    user: IUser;
}

export const Status = {
    1: 'Pending',
    2: 'Active',
    3: 'Suspended',
    4: 'Deleted'
};

export const KYCStatus = {
    1: 'Pending KYC',
    2: 'KYC passed',
    3: 'KYC rejected'
};

export function AdminUsersTable() {
    const adminClient = useSelector(getOffChainDataSource)?.adminClient;
    const userOffchain = useSelector(getUserOffchain);

    const history = useHistory();

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        if (!adminClient) {
            return {
                paginatedData: [],
                total: 0
            };
        }
        const entities = await adminClient.getAllUsers();

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
    }, [userOffchain, adminClient]);

    const columns = [
        { id: 'firstName', label: 'Name' },
        { id: 'organization', label: 'Organization' },
        { id: 'email', label: 'Email' },
        { id: 'status', label: 'Status' },
        { id: 'kycStatus', label: 'KYC status' }
    ] as const;

    const rows = paginatedData.map(({ user }) => {
        const organization = user.organization as IOrganization;
        return {
            firstName: user.title + ' ' + user.firstName + ' ' + user.lastName,
            organization: organization.name,
            email: user.email,
            status: Status[user.status],
            kycStatus: KYCStatus[user.kycStatus]
        };
    });

    const actions = [
        {
            icon: <Edit />,
            name: 'Update',
            onClick: (index: string) => {
                const user = paginatedData[index];
                history.push('user-update', user);
            }
        }
    ];

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
