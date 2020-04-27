import { IUser } from '@energyweb/origin-backend-core';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getOffChainDataSource } from '../features/general/selectors';
import { getUserOffchain } from '../features/users/selectors';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from './Table/PaginatedLoaderHooks';
import { TableMaterial } from './Table/TableMaterial';

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
        return {
            firstName: user.title + ' ' + user.firstName + ' ' + user.lastName,
            organization: user.organization.name,
            email: user.email,
            status: Status[user.status],
            kycStatus: KYCStatus[user.kycStatus]
        };
    });

    return (
        <TableMaterial
            columns={columns}
            rows={rows}
            loadPage={loadPage}
            total={total}
            pageSize={pageSize}
        />
    );
}
