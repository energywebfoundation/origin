import { IOrganization, IUser } from '@energyweb/origin-backend-core';
import { Edit } from '@material-ui/icons';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getOffChainDataSource } from '../features/general/selectors';
import { getUserOffchain } from '../features/users/selectors';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    TableMaterial,
    usePaginatedLoaderFiltered
} from './Table';
import { CustomFilterInputType, ICustomFilterDefinition } from './Table/FiltersHeader';

interface IRecord {
    user: IUser;
}

export const KeyStatus = {
    1: 'Pending',
    2: 'Active',
    3: 'Suspended',
    4: 'Deleted'
};

export const KeyKYCStatus = {
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
        offset,
        requestedFilters
    }: IPaginatedLoaderHooksFetchDataParameters) {
        if (!adminClient) {
            return {
                paginatedData: [],
                total: 0
            };
        }
        let entities = [];
        if (requestedFilters.length > 0) {
            entities = await adminClient.getUsersBy(
                requestedFilters[2]?.selectedValue,
                parseInt(requestedFilters[0]?.selectedValue, 10),
                parseInt(requestedFilters[1]?.selectedValue, 10)
            );
        } else {
            entities = await adminClient.getAllUsers();
        }
        let newPaginatedData: IRecord[] = entities.map((i) => ({
            user: i
        }));

        newPaginatedData = newPaginatedData.slice(offset, offset + requestedPageSize);
        const newTotal = newPaginatedData.length;

        return {
            paginatedData: newPaginatedData,
            total: newTotal
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoaderFiltered<IRecord>({
        getPaginatedData
    });

    useEffect(() => {
        loadPage(1);
    }, [userOffchain, adminClient]);

    function viewUser(index: number) {
        const user = paginatedData[index];
        history.push('user-update', user);
    }

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
            status: KeyStatus[user.status],
            kycStatus: KeyKYCStatus[user.kycStatus]
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

    const STATUS_OPTIONS = Object.keys(KeyStatus).map((key) => ({
        value: key.toString(),
        label: KeyStatus[key]
    }));

    const KYC_STATUS_OPTIONS = Object.keys(KeyKYCStatus).map((key) => ({
        value: key.toString(),
        label: KeyKYCStatus[key]
    }));

    const filters: ICustomFilterDefinition[] = [
        {
            property: (record: IUser) => `${record.status}`,
            label: 'Status',
            input: {
                type: CustomFilterInputType.dropdown,
                availableOptions: STATUS_OPTIONS
            }
        },
        {
            property: (record: IUser) => `${record.status}`,
            label: 'KYC Status',
            input: {
                type: CustomFilterInputType.dropdown,
                availableOptions: KYC_STATUS_OPTIONS
            }
        },
        {
            property: (record: IUser) => `${record.organization}`,
            label: 'Organization',
            input: {
                type: CustomFilterInputType.string
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
            filters={filters}
            handleRowClick={(index) => viewUser(parseInt(index, 10))}
        />
    );
}
