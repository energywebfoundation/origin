import { IPublicOrganization, IUser, UserStatus, KYCStatus } from '@energyweb/origin-backend-core';
import { Edit } from '@material-ui/icons';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getOffChainDataSource } from '../../features/general/selectors';
import { getUserOffchain } from '../../features/users/selectors';
import { NotificationType, showNotification } from '../../utils/notifications';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    TableMaterial,
    usePaginatedLoaderFiltered
} from '../Table';
import { CustomFilterInputType, ICustomFilterDefinition } from '../Table/FiltersHeader';

interface IRecord {
    user: IUser;
}

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

        const [statusFilter, kycStatusFilter, orgNameFilter] = requestedFilters;

        try {
            if (requestedFilters.length > 0) {
                entities = await adminClient.getUsers({
                    orgName: orgNameFilter?.selectedValue,
                    status: statusFilter?.selectedValue,
                    kycStatus: kycStatusFilter?.selectedValue
                });
            } else {
                entities = await adminClient.getUsers();
            }
        } catch (error) {
            const _error = { ...error };

            if (_error.response.status === 412) {
                showNotification(
                    `Only active users can perform this action. Your status is ${
                        UserStatus[userOffchain.status]
                    }`,
                    NotificationType.Error
                );
            }
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
        const organization = user.organization as IPublicOrganization;

        return {
            firstName: user.title + ' ' + user.firstName + ' ' + user.lastName,
            organization: organization?.name ?? '',
            email: user.email,
            status: UserStatus[user.status],
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

    const STATUS_OPTIONS = Object.keys(UserStatus)
        .filter((key) => isNaN(Number(key)))
        .map((key) => ({
            value: UserStatus[key],
            label: key.toString()
        }));

    const KYC_STATUS_OPTIONS = Object.keys(KYCStatus)
        .filter((key) => isNaN(Number(key)))
        .map((key) => ({
            value: KYCStatus[key],
            label: key.toString()
        }));

    const filters: ICustomFilterDefinition[] = [
        {
            property: (record: IUser) => record.status,
            label: 'Status',
            input: {
                type: CustomFilterInputType.dropdown,
                availableOptions: STATUS_OPTIONS
            }
        },
        {
            property: (record: IUser) => record.status,
            label: 'KYC Status',
            input: {
                type: CustomFilterInputType.dropdown,
                availableOptions: KYC_STATUS_OPTIONS
            }
        },
        {
            property: (record: IUser) => record.organization.toString(),
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
