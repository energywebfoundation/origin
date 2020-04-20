import React from 'react';
// import { useSelector } from 'react-redux';
// import { Redirect } from 'react-router-dom';

import { useTranslation } from '../utils';

import { CustomFilterInputType, ICustomFilterDefinition } from './Table/FiltersHeader';
import { IPaginatedLoaderFetchDataReturnValues } from './Table/PaginatedLoader';
import { TableMaterial } from './Table/TableMaterial';
// import { getUserOffchain } from '../features/users/selectors';

import {
    usePaginatedLoaderSorting,
    // checkRecordPassesFilters,
    usePaginatedLoaderFiltered,
    IPaginatedLoaderHooksFetchDataParameters
} from './Table';

interface IProps {
    hiddenColumns?: string[];
    selectedState: SelectedState;
}

interface IEnrichedAdminData {
    admin: any;
    locationText: string;
}

export enum SelectedState {
    OrganizationAndUser
}

const USER_ORGANIZATION = 'userOrganization';
type NewType = IEnrichedAdminData;

const USER_ORG_DATE_COLUMN_SORT_PROPERTIES = [(record: NewType) => record?.admin?.creationTime];

export function OrganizationAndUserTable(props: IProps) {
    const { currentSort, sortData } = usePaginatedLoaderSorting({
        currentSort: {
            id: USER_ORGANIZATION,
            sortProperties: USER_ORG_DATE_COLUMN_SORT_PROPERTIES
        },
        sortAscending: false
    });

    const hiddenColumns = props.hiddenColumns || [];
    const { t } = useTranslation();

    // const userAddress = user?.blockchainAccountAddress?.toLowerCase();

    async function getPaginatedData({
        offset
    }: IPaginatedLoaderHooksFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        const sortedEnrichedData = sortData;
        const total = sortedEnrichedData.length;
        const paginatedData = sortedEnrichedData.call(offset);

        return {
            paginatedData,
            total
        };
    }

    const { loadPage, paginatedData, pageSize, total } = usePaginatedLoaderFiltered<
        IEnrichedAdminData
    >({
        getPaginatedData
    });

    function getFilters(): ICustomFilterDefinition[] {
        const filters: ICustomFilterDefinition[] = [
            {
                property: (record: IEnrichedAdminData) => record?.locationText,
                label: t('admin.properties.userName'),
                input: {
                    type: CustomFilterInputType.string
                }
            },
            {
                property: (record: IEnrichedAdminData) => record?.locationText,
                label: t('admin.properties.status'),
                input: {
                    type: CustomFilterInputType.string
                }
            },
            {
                property: (record: IEnrichedAdminData) => record?.locationText,
                label: t('admin.properties.kycStatus'),
                input: {
                    type: CustomFilterInputType.string
                }
            }
        ];

        return filters.filter((filter) => !hiddenColumns.includes(filter.label));
    }

    const filters = getFilters();

    const columns = ([
        {
            id: 'userName',
            label: t('admin.properties.userName')
        },
        {
            id: 'contact',
            label: t('admin.properties.contact')
        },
        {
            id: 'status',
            label: t('admin.properties.status')
        },
        {
            id: 'kycStatus',
            label: t('admin.properties.kycStatus')
        }
    ] as const).filter((column) => !hiddenColumns.includes(column.id));

    const rows = paginatedData.map(() => {
        const userName = '';
        const contact = '';
        const status = '';
        const kycStatus = '';

        return {
            userName,
            contact,
            status,
            kycStatus
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
                currentSort={currentSort}
                filters={filters}
                // actions={actions}
            />
        </>
    );
}
